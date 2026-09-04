export type TestStatus = 
  | 'NOT_TESTED' 
  | 'IN_PROGRESS' 
  | 'PASSED' 
  | 'WARNING' 
  | 'FAILED' 
  | 'UNSUPPORTED' 
  | 'SKIPPED';

export type TrustScoreGrade = 'EXCELLENT' | 'GOOD' | 'INSPECT' | 'HIGH_RISK';

export type DiagnosticCategory = 
  | 'display_touch'
  | 'cameras'
  | 'audio'
  | 'sensors'
  | 'connectivity'
  | 'battery'
  | 'storage_hardware'
  | 'physical';

export interface DeviceInfo {
  deviceName: string;
  manufacturer: string;
  model: string;
  os: string;
  osVersion: string;
  browser: string;
  screenRes: string;
  pixelRatio: number;
  cpuCores: number;
  deviceMemoryGb?: number;
  storageQuotaGb?: number;
  storageUsedGb?: number;
  online: boolean;
  connectionType?: string;
  language: string;
  touchSupport: boolean;
  maxTouchPoints: number;
  isSimulated: boolean;
}

export interface TestItemResult {
  id: string;
  title: string;
  category: DiagnosticCategory;
  status: TestStatus;
  details: string;
  userNotes?: string;
  data?: Record<string, unknown>;
  testedAt?: string;
}

export interface PhysicalInspectionData {
  screenGlass: 'No damage' | 'Minor scratches' | 'Cracked' | 'Not inspected';
  bodyFrame: 'Excellent' | 'Minor wear' | 'Damaged' | 'Not inspected';
  cameraLens: 'Clean' | 'Scratched' | 'Damaged' | 'Not inspected';
  chargingPort: 'Good' | 'Loose' | 'Damaged' | 'Not inspected';
  powerButton: 'Working' | 'Intermittent' | 'Not working' | 'Not inspected';
  volumeButtons: 'Working' | 'Intermittent' | 'Not working' | 'Not inspected';
  simTray: 'Good' | 'Damaged' | 'Missing' | 'Not inspected';
  backPanel: 'Good' | 'Loose' | 'Damaged' | 'Not inspected';
  notes?: string;
}

export interface CategoryScoreResult {
  category: DiagnosticCategory;
  name: string;
  weight: number;
  score: number;
  status: TestStatus;
  testsCount: number;
}

export interface DiagnosticStats {
  total: number;
  tested: number;
  passed: number;
  warning: number;
  failed: number;
  unsupported: number;
  skipped: number;
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  device: DeviceInfo;
  overallScore: number;
  grade: TrustScoreGrade;
  gradeLabel: string;
  tests: Record<string, TestItemResult>;
  categoryScores: Record<DiagnosticCategory, CategoryScoreResult>;
  stats: DiagnosticStats;
  physicalInspection: PhysicalInspectionData;
  warnings: string[];
  recommendations: string[];
  inspectorNotes: string;
  isDemo: boolean;
}
