import { DeviceInfo, DiagnosticReport, TestItemResult, PhysicalInspectionData } from '../types/diagnostic';
import { StorageService } from './storageService';
import { calculateTrustScoreFromTests, getGradeFromScore } from '../utils/trustScore';

export const DiagnosticService = {
  getReports(): DiagnosticReport[] {
    return StorageService.getReports();
  },

  getReportById(id: string): DiagnosticReport | undefined {
    return StorageService.getReportById(id);
  },

  deleteReport(id: string): void {
    StorageService.deleteReport(id);
  },

  createReport(
    device: DeviceInfo,
    tests: Record<string, TestItemResult>,
    physical: PhysicalInspectionData
  ): DiagnosticReport {
    // Physical score computation
    let physicalScore = 100;
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (physical.screenGlass === 'Cracked') {
      physicalScore -= 40;
      warnings.push('Front screen glass is cracked - high touch failure / moisture risk.');
      recommendations.push('Replace display assembly before transaction.');
    } else if (physical.screenGlass === 'Minor scratches') {
      physicalScore -= 10;
    }

    if (physical.bodyFrame === 'Damaged') {
      physicalScore -= 20;
      warnings.push('Body chassis or frame shows structural impact damage.');
    } else if (physical.bodyFrame === 'Minor wear') {
      physicalScore -= 5;
    }

    if (physical.chargingPort === 'Damaged' || physical.chargingPort === 'Loose') {
      physicalScore -= 25;
      warnings.push('USB/Lightning charging port is loose or damaged.');
      recommendations.push('Inspect power rails and clean debris from port.');
    }

    if (physical.cameraLens === 'Scratched' || physical.cameraLens === 'Damaged') {
      physicalScore -= 15;
      warnings.push('Camera lens optic scratched - image flare or focus failure expected.');
    }

    if (physical.powerButton === 'Not working' || physical.volumeButtons === 'Not working') {
      physicalScore -= 20;
      warnings.push('Physical mechanical button failure reported.');
    }

    physicalScore = Math.max(0, physicalScore);

    // Compute stats
    const allTests = Object.values(tests);
    let passedCount = 0;
    let warningCount = 0;
    let failedCount = 0;
    let unsupportedCount = 0;
    let skippedCount = 0;

    allTests.forEach((t) => {
      if (t.status === 'PASSED') passedCount++;
      else if (t.status === 'WARNING') {
        warningCount++;
        warnings.push(`${t.title}: ${t.details || 'Minor issue reported during test.'}`);
      } else if (t.status === 'FAILED') {
        failedCount++;
        warnings.push(`${t.title} FAILED: ${t.details || 'Hardware component failed response test.'}`);
      } else if (t.status === 'UNSUPPORTED') {
        unsupportedCount++;
      } else if (t.status === 'SKIPPED') {
        skippedCount++;
      }
    });

    // Score calculations
    const { overallScore, categoryScores } = calculateTrustScoreFromTests(tests, physicalScore);
    const { grade, label } = getGradeFromScore(overallScore);

    if (warnings.length === 0) {
      recommendations.push('Device condition is consistent with nominal testing standards.');
      recommendations.push('All evaluated hardware components passed interactive verification.');
    } else {
      recommendations.push('Review identified warnings before completing purchase or refurbishment.');
    }

    if (unsupportedCount > 0) {
      recommendations.push('Certain hardware diagnostics require external native/Raspberry Pi measurement.');
    }

    const idSuffix = Math.floor(10000 + Math.random() * 90000);
    const reportId = `ATH-${idSuffix}-${device.manufacturer.substring(0, 3).toUpperCase()}`;

    const report: DiagnosticReport = {
      id: reportId,
      timestamp: new Date().toISOString(),
      device,
      overallScore,
      grade,
      gradeLabel: `${label} Condition`,
      tests,
      categoryScores,
      stats: {
        total: allTests.length,
        tested: passedCount + warningCount + failedCount,
        passed: passedCount,
        warning: warningCount,
        failed: failedCount,
        unsupported: unsupportedCount,
        skipped: skippedCount,
      },
      physicalInspection: physical,
      warnings,
      recommendations,
      inspectorNotes: `AuthentiX Interactive Device Inspection completed with ${passedCount} passed tests, ${warningCount} warnings, and ${failedCount} failures.`,
      isDemo: device.isSimulated,
    };

    StorageService.saveReport(report);

    StorageService.clearActiveInspection();
    return report;
  }
};


