import { DiagnosticCategory, TestStatus, TrustScoreGrade, CategoryScoreResult } from '../types/diagnostic';

export const CATEGORY_WEIGHTS: Record<DiagnosticCategory, { weight: number; name: string }> = {
  display_touch: { weight: 0.20, name: 'Display & Touch' },
  cameras: { weight: 0.15, name: 'Camera Subsystems' },
  audio: { weight: 0.15, name: 'Audio & Acoustics' },
  sensors: { weight: 0.10, name: 'Sensors & Haptics' },
  connectivity: { weight: 0.10, name: 'RF & Connectivity' },
  battery: { weight: 0.10, name: 'Battery & Power' },
  storage_hardware: { weight: 0.10, name: 'Storage & Hardware' },
  physical: { weight: 0.10, name: 'Physical Condition' },
};

export function calculateTrustScoreFromTests(
  tests: Record<string, { category: DiagnosticCategory; status: TestStatus }>,
  physicalScore: number = 100
): { overallScore: number; categoryScores: Record<DiagnosticCategory, CategoryScoreResult> } {
  const categoryScores: Record<DiagnosticCategory, CategoryScoreResult> = {} as Record<DiagnosticCategory, CategoryScoreResult>;

  // Group tests by category
  const categoryTestsMap: Record<DiagnosticCategory, { total: number; scoreSum: number; activeWeightCount: number; hasFail: boolean; hasWarn: boolean }> = {
    display_touch: { total: 0, scoreSum: 0, activeWeightCount: 0, hasFail: false, hasWarn: false },
    cameras: { total: 0, scoreSum: 0, activeWeightCount: 0, hasFail: false, hasWarn: false },
    audio: { total: 0, scoreSum: 0, activeWeightCount: 0, hasFail: false, hasWarn: false },
    sensors: { total: 0, scoreSum: 0, activeWeightCount: 0, hasFail: false, hasWarn: false },
    connectivity: { total: 0, scoreSum: 0, activeWeightCount: 0, hasFail: false, hasWarn: false },
    battery: { total: 0, scoreSum: 0, activeWeightCount: 0, hasFail: false, hasWarn: false },
    storage_hardware: { total: 0, scoreSum: 0, activeWeightCount: 0, hasFail: false, hasWarn: false },
    physical: { total: 1, scoreSum: physicalScore, activeWeightCount: 1, hasFail: physicalScore < 60, hasWarn: physicalScore >= 60 && physicalScore < 85 },
  };

  Object.values(tests).forEach((t) => {
    const cat = t.category;
    if (!categoryTestsMap[cat]) return;

    categoryTestsMap[cat].total += 1;

    if (t.status === 'PASSED') {
      categoryTestsMap[cat].scoreSum += 100;
      categoryTestsMap[cat].activeWeightCount += 1;
    } else if (t.status === 'WARNING') {
      categoryTestsMap[cat].scoreSum += 65;
      categoryTestsMap[cat].activeWeightCount += 1;
      categoryTestsMap[cat].hasWarn = true;
    } else if (t.status === 'FAILED') {
      categoryTestsMap[cat].scoreSum += 0;
      categoryTestsMap[cat].activeWeightCount += 1;
      categoryTestsMap[cat].hasFail = true;
    }
    // Note: UNSUPPORTED and SKIPPED tests are not added to activeWeightCount,
    // so browser limitations do not drag down the device score.
  });

  let totalWeightedScore = 0;
  let totalActiveWeight = 0;

  (Object.keys(CATEGORY_WEIGHTS) as DiagnosticCategory[]).forEach((cat) => {
    const info = CATEGORY_WEIGHTS[cat];
    const data = categoryTestsMap[cat];
    
    let catScore = 100;
    let catStatus: TestStatus = 'PASSED';

    if (data.activeWeightCount > 0) {
      catScore = Math.round(data.scoreSum / data.activeWeightCount);
      if (data.hasFail || catScore < 60) catStatus = 'FAILED';
      else if (data.hasWarn || catScore < 85) catStatus = 'WARNING';
      else catStatus = 'PASSED';

      totalWeightedScore += (catScore * info.weight);
      totalActiveWeight += info.weight;
    } else {
      catStatus = 'UNSUPPORTED';
      catScore = 0;
    }

    categoryScores[cat] = {
      category: cat,
      name: info.name,
      weight: info.weight,
      score: catScore,
      status: catStatus,
      testsCount: data.total,
    };
  });

  // Re-normalize score across active tested categories
  const overallScore = totalActiveWeight > 0 
    ? Math.round(totalWeightedScore / totalActiveWeight)
    : 85;

  return { overallScore, categoryScores };
}

export function getGradeFromScore(score: number): { grade: TrustScoreGrade; label: string; color: string; bgClass: string; borderClass: string } {
  if (score >= 90) {
    return { 
      grade: 'EXCELLENT', 
      label: 'Excellent', 
      color: '#39E58C',
      bgClass: 'bg-[#39E58C]/10 text-[#39E58C]',
      borderClass: 'border-[#39E58C]/30'
    };
  }
  if (score >= 75) {
    return { 
      grade: 'GOOD', 
      label: 'Good', 
      color: '#20B8FF',
      bgClass: 'bg-[#20B8FF]/10 text-[#20B8FF]',
      borderClass: 'border-[#20B8FF]/30'
    };
  }
  if (score >= 60) {
    return { 
      grade: 'INSPECT', 
      label: 'Inspect', 
      color: '#FFB84D',
      bgClass: 'bg-[#FFB84D]/10 text-[#FFB84D]',
      borderClass: 'border-[#FFB84D]/30'
    };
  }
  return { 
    grade: 'HIGH_RISK', 
    label: 'High Risk', 
    color: '#FF5C6C',
    bgClass: 'bg-[#FF5C6C]/10 text-[#FF5C6C]',
    borderClass: 'border-[#FF5C6C]/30'
  };
}

export function getStatusBadge(status: TestStatus): { label: string; color: string; bgClass: string; borderClass: string } {
  switch (status) {
    case 'PASSED':
      return { label: 'PASSED', color: '#39E58C', bgClass: 'bg-status-success/15 text-status-success', borderClass: 'border-status-success/40' };
    case 'WARNING':
      return { label: 'WARNING', color: '#FFB84D', bgClass: 'bg-status-warning/15 text-status-warning', borderClass: 'border-status-warning/40' };
    case 'FAILED':
      return { label: 'FAILED', color: '#FF5C6C', bgClass: 'bg-status-critical/15 text-status-critical', borderClass: 'border-status-critical/40' };
    case 'UNSUPPORTED':
      return { label: 'UNSUPPORTED', color: '#8496A8', bgClass: 'bg-white/5 text-text-muted', borderClass: 'border-white/10' };
    case 'SKIPPED':
      return { label: 'SKIPPED', color: '#4F6174', bgClass: 'bg-white/5 text-text-dim', borderClass: 'border-white/10' };
    case 'IN_PROGRESS':
      return { label: 'TESTING', color: '#20B8FF', bgClass: 'bg-accent-cyan/15 text-accent-cyan', borderClass: 'border-accent-cyan/40' };
    default:
      return { label: 'NOT TESTED', color: '#4F6174', bgClass: 'bg-transparent text-text-dim', borderClass: 'border-bg-border' };
  }
}
