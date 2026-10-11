import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DeviceInfo,
  DiagnosticReport,
  TestItemResult,
  PhysicalInspectionData,
  PowerMetrics,
} from '../types/diagnostic';

import { DiagnosticService } from '../services/diagnosticService';
import { SupabaseDiagnosticService } from '../services/supabaseDiagnosticService';
import { detectCurrentEnvironment } from '../utils/deviceDetector';
import { StorageService } from '../services/storageService';
import { getPowerMetrics } from '../services/powerService';
import { useAuth } from './AuthContext';

interface DiagnosticContextType {
  reports: DiagnosticReport[];
  currentDevice: DeviceInfo | null;
  powerMetrics: PowerMetrics | null;

  detectDevice: () => Promise<DeviceInfo>;

  saveCompletedReport: (
    device: DeviceInfo,
    tests: Record<string, TestItemResult>,
    physical: PhysicalInspectionData
  ) => DiagnosticReport;

  deleteReport: (id: string) => Promise<void>;

  refreshReports: () => Promise<void>;
}

const DiagnosticContext =
  createContext<DiagnosticContextType | undefined>(undefined);

export const DiagnosticProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [currentDevice, setCurrentDevice] =
    useState<DeviceInfo | null>(null);
  const [powerMetrics, setPowerMetrics] = useState<PowerMetrics | null>(null);

  const refreshReports = async () => {
    if (!user) {
      setReports([]);
      return;
    }

    try {
      const cloudReports =
        await SupabaseDiagnosticService.getReports();

      setReports(cloudReports);
    } catch (error) {
      console.error(
        'Failed to load reports from Supabase:',
        error
      );

      // Do not fall back to the old shared local report store.
      // That store was browser-wide and could expose another user's history.
      setReports([]);
    }
  };

  // Refresh report history whenever the signed-in account changes.
  useEffect(() => {
    if (!user) {
      setReports([]);
      return;
    }

    void refreshReports();
  }, [user?.id]);

  // Device/environment detection is independent of the signed-in account.
  useEffect(() => {
    detectCurrentEnvironment()
      .then((dev) => setCurrentDevice(dev))
      .catch(() => {});
  }, []);

  // Keep the latest Raspberry Pi INA219 sample available for the report.
  // If the Pi is offline, normal browser diagnostics continue unaffected.
  useEffect(() => {
    let active = true;

    const refreshPower = async () => {
      try {
        const metrics = await getPowerMetrics();
        if (active) setPowerMetrics(metrics);
      } catch {
        // Hardware is optional. Preserve the last valid sample if one exists.
      }
    };

    void refreshPower();
    const intervalId = window.setInterval(refreshPower, 2000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const detectDevice = async (): Promise<DeviceInfo> => {
    const dev = await detectCurrentEnvironment();

    setCurrentDevice(dev);

    return dev;
  };

  const saveCompletedReport = (
    device: DeviceInfo,
    tests: Record<string, TestItemResult>,
    physical: PhysicalInspectionData
  ): DiagnosticReport => {
    const report = DiagnosticService.createReport(
      device,
      tests,
      physical,
      powerMetrics || undefined
    );

    // Add report to React state immediately for the current user.
    setReports((prev) => [
      report,
      ...prev.filter(
        (existing) => existing.id !== report.id
      ),
    ]);

    // Save to Supabase in background. saveReport stores the current auth user_id.
    void SupabaseDiagnosticService
      .saveReport(report)
      .catch((error) => {
        console.error(
          'Failed to save diagnostic report to Supabase:',
          error
        );
      });

    return report;
  };

  const deleteReport = async (id: string): Promise<void> => {
    const reportToRestore =
      reports.find((report) => report.id === id) || null;

    // Remove immediately from UI.
    setReports((prev) =>
      prev.filter((report) => report.id !== id)
    );

    // Remove local copy immediately.
    DiagnosticService.deleteReport(id);

    try {
      // Cloud deletion is also scoped to the authenticated user.
      await SupabaseDiagnosticService.deleteReport(id);
    } catch (error) {
      console.error(
        'Failed to delete diagnostic report from Supabase:',
        error
      );

      // Restore report if cloud deletion failed.
      if (reportToRestore) {
        StorageService.saveReport(reportToRestore);

        setReports((prev) => {
          if (
            prev.some(
              (report) => report.id === reportToRestore.id
            )
          ) {
            return prev;
          }

          return [reportToRestore, ...prev];
        });
      }

      throw error;
    }
  };

  return (
    <DiagnosticContext.Provider
      value={{
        reports,
        currentDevice,
        powerMetrics,
        detectDevice,
        saveCompletedReport,
        deleteReport,
        refreshReports,
      }}
    >
      {children}
    </DiagnosticContext.Provider>
  );
};

export const useDiagnostic =
  (): DiagnosticContextType => {
    const context = useContext(DiagnosticContext);

    if (!context) {
      throw new Error(
        'useDiagnostic must be used within a DiagnosticProvider'
      );
    }

    return context;
  };
