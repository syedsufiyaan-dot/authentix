import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Download, 
  Printer, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Smartphone,
  Eye,
  Grid,
  Camera,
  Mic,
  Volume2,
  Vibrate,
  HardDrive,
  Wifi,
  Bluetooth,
  MapPin,
  Compass,
  BatteryCharging,
  Cpu,
  CheckSquare,
  XCircle
} from 'lucide-react';
import { useDiagnostic } from '../context/DiagnosticContext';
import { CircularGauge } from '../components/common/CircularGauge';
import { DisclaimerBadge, PlatformDisclaimerBanner } from '../components/common/DisclaimerBadge';
import { generateReportPdf } from '../services/reportPdfService';
import { TrustScoreModal } from '../components/diagnostic/TrustScoreModal';
import { getGradeFromScore, getStatusBadge } from '../utils/trustScore';
import { useToast } from '../components/common/Toast';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { reports } = useDiagnostic();
  const { toast } = useToast();

  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const report = reports.find((r) => r.id === id) || reports[0];

  if (!report) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <Link to="/app/history" className="text-accent-teal hover:underline font-mono text-xs">
          Return to Scan History
        </Link>
      </div>
    );
  }

  const { label, bgClass, borderClass } = getGradeFromScore(report.overallScore);

  const getFinalVerdict = (score: number) => {
    if (score >= 90) {
      return {
        title: 'Recommended to Buy',
        description: 'The device shows strong overall diagnostic health with no major concerns detected.',
        className: 'border-status-success/40 bg-status-success/10 text-status-success',
      };
    }

    if (score >= 75) {
      return {
        title: 'Good Device - Proceed with Normal Checks',
        description: 'The device is generally healthy, but review any warnings before completing the purchase.',
        className: 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan',
      };
    }

    if (score >= 60) {
      return {
        title: 'Inspection Recommended',
        description: 'Some diagnostic areas need attention. Review failed tests, warnings, and physical condition carefully.',
        className: 'border-status-warning/40 bg-status-warning/10 text-status-warning',
      };
    }

    return {
      title: 'Not Recommended Without Repair',
      description: 'The device has significant diagnostic concerns. Repair or professional inspection is recommended before purchase.',
      className: 'border-status-critical/40 bg-status-critical/10 text-status-critical',
    };
  };

  const finalVerdict = getFinalVerdict(report.overallScore);



  const handleDownloadPdf = async () => {
    try {
      await generateReportPdf(report);
      toast('AuthentiX PDF report downloaded successfully.', 'success');
    } catch {
      toast('Failed to export PDF report.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const iconMap: Record<string, React.ElementType> = {
    device_info: Smartphone,
    display: Eye,
    touch: Grid,
    front_camera: Camera,
    rear_camera: Camera,
    mic: Mic,
    speaker: Volume2,
    vibration: Vibrate,
    storage: HardDrive,
    network: Wifi,
    bluetooth: Bluetooth,
    gps: MapPin,
    motion: Compass,
    battery: BatteryCharging,
    hardware: Cpu,
    physical: CheckSquare,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 select-none pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-accent-teal font-bold">REPORT: {report.id}</span>
            <DisclaimerBadge type={report.isDemo ? 'prototype' : 'browser'} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            {report.device.deviceName} Diagnostic Report
          </h1>
          <p className="text-xs text-text-muted font-mono">
            Generated {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 rounded-xl bg-accent-teal text-bg-darkest font-bold text-xs font-mono uppercase tracking-wider hover:bg-accent-teal/90 transition-all shadow-teal-glow flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl glass-panel hover:border-accent-cyan text-text-muted hover:text-white transition-colors"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
          <Link
            to="/app/diagnostic"
            className="p-2.5 rounded-xl glass-panel hover:border-accent-teal text-text-muted hover:text-white transition-colors"
            title="Run Diagnostic Again"
          >
            <RotateCcw className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Hero Score Gauge Banner */}
      <div className="p-8 rounded-3xl glass-panel-glow border border-accent-teal/25 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <CircularGauge value={report.overallScore} size={190} />
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full font-mono text-xs font-bold border ${bgClass} ${borderClass}`}>
              {label.toUpperCase()} CONDITION
            </span>
          </div>
        </div>

        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-mono">AUTHENTIX TRUST SCORE</h2>
            <button
              onClick={() => setShowFormulaModal(true)}
              className="text-xs font-mono text-accent-cyan hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              How was my score calculated?
            </button>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            {report.inspectorNotes}
          </p>

          {/* Inspection Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-status-success/10 border border-status-success/30 text-center">
              <span className="text-[10px] text-text-muted block">PASSED</span>
              <span className="text-base font-bold text-status-success">{report.stats.passed} Tests</span>
            </div>
            <div className="p-2.5 rounded-xl bg-status-warning/10 border border-status-warning/30 text-center">
              <span className="text-[10px] text-text-muted block">WARNINGS</span>
              <span className="text-base font-bold text-status-warning">{report.stats.warning} Tests</span>
            </div>
            <div className="p-2.5 rounded-xl bg-status-critical/10 border border-status-critical/30 text-center">
              <span className="text-[10px] text-text-muted block">FAILED</span>
              <span className="text-base font-bold text-status-critical">{report.stats.failed} Tests</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] text-text-muted block">UNSUPPORTED</span>
              <span className="text-base font-bold text-text-muted">{report.stats.unsupported} Tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Score Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Trust Score Breakdown
            </h3>
            <p className="text-xs text-text-muted font-mono mt-1">
              Weighted category contribution to the final AuthentiX score.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(report.categoryScores).map((category) => {
            const categoryGrade = getGradeFromScore(category.score);

            return (
              <div
                key={category.category}
                className="p-4 rounded-2xl glass-panel border border-bg-border space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-text-dim uppercase">
                      {category.weight}% WEIGHT
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      {category.name}
                    </h4>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md border text-[9px] font-mono ${categoryGrade.bgClass} ${categoryGrade.borderClass}`}
                  >
                    {categoryGrade.label}
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-accent-teal font-mono">
                      {category.score}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">
                      {' '} / 100
                    </span>
                  </div>

                  <span className="text-[10px] text-text-dim font-mono">
                    {category.testsCount} TESTS
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-teal transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, category.score))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Complete Hardware Tests Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-wide">Hardware Diagnostic Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(report.tests).map((test) => {
            const Icon = iconMap[test.id] || Cpu;
            const badge = getStatusBadge(test.status);
            return (
              <div
                key={test.id}
                className="p-5 rounded-2xl glass-panel border border-bg-border hover:border-accent-teal/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{test.title}</h4>
                      <span className="text-[10px] font-mono text-text-dim uppercase">
                        {test.category.replace('_', ' & ')}
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${badge.bgClass} ${badge.borderClass}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs text-text-muted leading-relaxed font-mono">
                  {test.details}
                </p>

                {test.userNotes && (
                  <div className="text-[11px] text-text-dim italic border-t border-bg-border/40 pt-1.5">
                    Inspector note: {test.userNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Physical Inspection Breakdown */}
      {report.physicalInspection && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-wide">Physical Condition Checklist</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-text-dim block text-[10px]">SCREEN GLASS</span>
              <span className="text-white font-bold">{report.physicalInspection.screenGlass}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-text-dim block text-[10px]">BODY / FRAME</span>
              <span className="text-white font-bold">{report.physicalInspection.bodyFrame}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-text-dim block text-[10px]">CAMERA LENS</span>
              <span className="text-white font-bold">{report.physicalInspection.cameraLens}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-text-dim block text-[10px]">CHARGING PORT</span>
              <span className="text-white font-bold">{report.physicalInspection.chargingPort}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-text-dim block text-[10px]">POWER BUTTON</span>
              <span className="text-white font-bold">{report.physicalInspection.powerButton}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-text-dim block text-[10px]">VOLUME BUTTONS</span>
              <span className="text-white font-bold">{report.physicalInspection.volumeButtons}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-text-dim block text-[10px]">SIM TRAY</span>
              <span className="text-white font-bold">{report.physicalInspection.simTray}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-text-dim block text-[10px]">BACK PANEL</span>
              <span className="text-white font-bold">{report.physicalInspection.backPanel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Warnings & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.warnings.length > 0 && (
          <div className="p-5 rounded-2xl glass-panel border-l-2 border-l-status-warning space-y-2">
            <h4 className="text-xs font-bold font-mono text-status-warning flex items-center gap-1.5 uppercase">
              <AlertTriangle className="w-4 h-4" />
              Identified Warnings
            </h4>
            <ul className="space-y-1.5 text-xs text-text-muted">
              {report.warnings.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-status-warning">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-5 rounded-2xl glass-panel border-l-2 border-l-accent-teal space-y-2">
          <h4 className="text-xs font-bold font-mono text-accent-teal flex items-center gap-1.5 uppercase">
            <CheckCircle2 className="w-4 h-4" />
            Recommendations
          </h4>
          <ul className="space-y-1.5 text-xs text-text-muted">
            {report.recommendations.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-accent-teal">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PlatformDisclaimerBanner />

      <TrustScoreModal isOpen={showFormulaModal} onClose={() => setShowFormulaModal(false)} />
    </div>
  );
};






