import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DeviceInfo,
  DiagnosticReport,
  TestItemResult,
  PhysicalInspectionData
} from '../types/diagnostic';

import { DiagnosticService } from '../services/diagnosticService';
import { SupabaseDiagnosticService } from '../services/supabaseDiagnosticService';
import { detectCurrentEnvironment } from '../utils/deviceDetector';
import { StorageService } from '../services/storageService';

interface DiagnosticContextType {
  reports: DiagnosticReport[];
  currentDevice: DeviceInfo | null;

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
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [currentDevice, setCurrentDevice] =
    useState<DeviceInfo | null>(null);

  const refreshReports = async () => {
    try {
      const cloudReports =
        await SupabaseDiagnosticService.getReports();

      setReports(cloudReports);
    } catch (error) {
      console.error(
        'Failed to load reports from Supabase:',
        error
      );

      setReports(DiagnosticService.getReports());
    }
  };

  useEffect(() => {
    void refreshReports();

    detectCurrentEnvironment()
      .then((dev) => setCurrentDevice(dev))
      .catch(() => {});
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
      physical
    );

    // IMPORTANT:
    // Add report to React state immediately.
    // Do NOT refresh from Supabase here.
    setReports((prev) => [
      report,
      ...prev.filter(
        (existing) => existing.id !== report.id
      ),
    ]);

    // Save to Supabase in background.
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
      // Wait for cloud deletion.
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
