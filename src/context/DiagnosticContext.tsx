import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeviceInfo, DiagnosticReport, TestItemResult, PhysicalInspectionData } from '../types/diagnostic';
import { DiagnosticService } from '../services/diagnosticService';
import { SupabaseDiagnosticService } from '../services/supabaseDiagnosticService';
import { detectCurrentEnvironment } from '../utils/deviceDetector';
import { StorageService } from '../services/storageService';

interface DiagnosticContextType {
  reports: DiagnosticReport[];
  currentDevice: DeviceInfo | null;
  detectDevice: () => Promise<DeviceInfo>;
  saveCompletedReport: (device: DeviceInfo, tests: Record<string, TestItemResult>, physical: PhysicalInspectionData) => DiagnosticReport;
  deleteReport: (id: string) => void;
  refreshReports: () => Promise<void>;
}

const DiagnosticContext = createContext<DiagnosticContextType | undefined>(undefined);

export const DiagnosticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);

  const refreshReports = async () => {
    try {
      const cloudReports = await SupabaseDiagnosticService.getReports();
      setReports(cloudReports);
    } catch (error) {
      console.error('Failed to load reports from Supabase:', error);
      setReports(DiagnosticService.getReports());
    }
  };

  useEffect(() => {
    void refreshReports();
    detectCurrentEnvironment().then((dev) => setCurrentDevice(dev)).catch(() => {});
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
    const report = DiagnosticService.createReport(device, tests, physical);
    void refreshReports();
    return report;
  };

  const deleteReport = (id: string) => {
    DiagnosticService.deleteReport(id);
    void refreshReports();
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

export const useDiagnostic = (): DiagnosticContextType => {
  const context = useContext(DiagnosticContext);
  if (!context) throw new Error('useDiagnostic must be used within a DiagnosticProvider');
  return context;
};

