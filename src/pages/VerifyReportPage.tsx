import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldX,
  Smartphone,
  CalendarDays,
  Gauge,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthentixLogo } from '../components/common/AuthentixLogo';
import { getGradeFromScore } from '../utils/trustScore';
import type { DiagnosticReport, TestStatus } from '../types/diagnostic';

interface PublicReport {
  report_code: string;
  device_name: string | null;
  manufacturer: string | null;
  trust_score: number;
  completed_at: string | null;
  status: string;
  report_data: DiagnosticReport | null;
}

const getStatusStyle = (status: TestStatus) => {
  switch (status) {
    case 'PASSED':
      return {
        label: 'PASSED',
        className: 'text-status-success border-status-success/30 bg-status-success/10',
        icon: CheckCircle2,
      };
    case 'WARNING':
      return {
        label: 'WARNING',
        className: 'text-status-warning border-status-warning/30 bg-status-warning/10',
        icon: AlertTriangle,
      };
    case 'FAILED':
      return {
        label: 'FAILED',
        className: 'text-status-critical border-status-critical/30 bg-status-critical/10',
        icon: XCircle,
      };
    default:
      return {
        label: status.replace('_', ' '),
        className: 'text-text-muted border-bg-border bg-white/5',
        icon: HelpCircle,
      };
  }
};

export const VerifyReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();

  const [report, setReport] = useState<PublicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const verifyReport = async () => {
      if (!reportId) {
        setInvalid(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('diagnostic_sessions')
        .select(
          'report_code, device_name, manufacturer, trust_score, completed_at, status, report_data'
        )
        .eq('report_code', reportId)
        .eq('status', 'completed')
        .maybeSingle();

      if (error || !data) {
        setInvalid(true);
      } else {
        setReport(data as PublicReport);
      }

      setLoading(false);
    };

    void verifyReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-darkest flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-accent-teal/20 border-t-accent-teal rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest">
            Loading AuthentiX Inspection Report...
          </p>
        </div>
      </div>
    );
  }

  if (invalid || !report) {
    return (
      <div className="min-h-screen bg-bg-darkest text-white flex flex-col">
        <header className="px-6 py-4 border-b border-bg-border">
          <AuthentixLogo variant="full" size={32} />
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-lg w-full text-center p-8 rounded-3xl glass-panel border border-status-critical/30 space-y-5">
            <div className="w-16 h-16 rounded-full bg-status-critical/10 border border-status-critical/30 flex items-center justify-center mx-auto">
              <ShieldX className="w-8 h-8 text-status-critical" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold">Report Not Verified</h1>
              <p className="text-sm text-text-muted mt-2">
                AuthentiX could not find a completed diagnostic report matching this report ID.
              </p>
            </div>

            <div className="text-xs font-mono text-text-dim">REPORT ID: {reportId}</div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-accent-teal hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to AuthentiX
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const fullReport = report.report_data;
  const grade = getGradeFromScore(report.trust_score);

  const verdict =
    report.trust_score >= 90
      ? 'RECOMMENDED TO BUY'
      : report.trust_score >= 75
      ? 'GOOD DEVICE - PROCEED WITH NORMAL CHECKS'
      : report.trust_score >= 60
      ? 'INSPECTION RECOMMENDED BEFORE BUYING'
      : 'NOT RECOMMENDED WITHOUT REPAIR';

  return (
    <div className="min-h-screen bg-bg-darkest text-white">
      <header className="px-6 py-4 border-b border-bg-border sticky top-0 z-20 bg-bg-darkest/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <AuthentixLogo variant="full" size={32} />
          <span className="text-[10px] font-mono text-accent-teal uppercase tracking-widest">
            Verified Inspection Report
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <section className="p-6 md:p-8 rounded-3xl glass-panel-glow border border-accent-teal/30 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-status-success/10 border border-status-success/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-status-success" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-status-success uppercase tracking-[0.2em]">
                Verified by AuthentiX
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold mt-2">
                Complete Diagnostic Inspection Result
              </h1>
              <p className="text-xs text-text-muted mt-2">
                This page contains the recorded inspection details linked to the QR code.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-[10px] text-text-dim font-mono">REPORT ID</span>
              <p className="text-sm font-bold font-mono mt-1">{report.report_code}</p>
            </div>

            <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-[10px] text-text-dim font-mono">DEVICE</span>
              <div className="flex items-center gap-2 mt-1">
                <Smartphone className="w-4 h-4 text-accent-teal" />
                <p className="text-sm font-bold">{report.device_name || 'Unknown Device'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-[10px] text-text-dim font-mono">INSPECTION DATE</span>
              <div className="flex items-center gap-2 mt-1">
                <CalendarDays className="w-4 h-4 text-accent-cyan" />
                <p className="text-xs font-bold">
                  {report.completed_at
                    ? new Date(report.completed_at).toLocaleString()
                    : 'Not available'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-[10px] text-text-dim font-mono">TRUST SCORE</span>
              <div className="flex items-center gap-2 mt-1">
                <Gauge className="w-4 h-4 text-accent-teal" />
                <span className="text-xl font-extrabold">{report.trust_score}</span>
                <span className="text-xs text-text-muted">/ 100</span>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${grade.bgClass} ${grade.borderClass}`}>
            <span className="text-[10px] uppercase font-mono tracking-widest opacity-70">
              AuthentiX Final Purchase Verdict
            </span>
            <h2 className="text-lg font-extrabold mt-1">{verdict}</h2>
            <p className="text-xs text-text-muted mt-2">
              Condition classification: {grade.label}
            </p>
          </div>
        </section>

        {fullReport ? (
          <>
            <section className="p-6 rounded-3xl glass-panel border border-bg-border space-y-4">
              <div>
                <h2 className="text-lg font-bold">Device Information</h2>
                <p className="text-xs text-text-muted mt-1">Recorded device and browser telemetry used during the inspection.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                {[
                  ['Device Name', fullReport.device.deviceName],
                  ['Manufacturer', fullReport.device.manufacturer],
                  ['Model', fullReport.device.model],
                  ['OS', `${fullReport.device.os} ${fullReport.device.osVersion}`],
                  ['Browser', fullReport.device.browser],
                  ['Display', `${fullReport.device.screenRes} @${fullReport.device.pixelRatio}x`],
                  ['CPU', `${fullReport.device.cpuCores} logical threads`],
                  ['Touch', fullReport.device.touchSupport ? `${fullReport.device.maxTouchPoints} touch points` : 'Pointer only'],
                ].map(([label, value]) => (
                  <div key={label} className="p-3 rounded-xl bg-bg-darker border border-bg-border">
                    <span className="text-[10px] text-text-dim block">{label.toUpperCase()}</span>
                    <span className="text-white font-bold break-words">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-6 rounded-3xl glass-panel border border-bg-border space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Inspection Summary</h2>
                  <p className="text-xs text-text-muted mt-1">Complete test totals recorded by AuthentiX.</p>
                </div>
                <span className="text-xs font-mono text-accent-teal">
                  {fullReport.stats.tested}/{fullReport.stats.total} TESTED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-3 rounded-xl bg-status-success/10 border border-status-success/30">
                  <div className="text-xl font-bold text-status-success">{fullReport.stats.passed}</div>
                  <div className="text-[10px] text-text-muted">PASSED</div>
                </div>
                <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/30">
                  <div className="text-xl font-bold text-status-warning">{fullReport.stats.warning}</div>
                  <div className="text-[10px] text-text-muted">WARNINGS</div>
                </div>
                <div className="p-3 rounded-xl bg-status-critical/10 border border-status-critical/30">
                  <div className="text-xl font-bold text-status-critical">{fullReport.stats.failed}</div>
                  <div className="text-[10px] text-text-muted">FAILED</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-bg-border">
                  <div className="text-xl font-bold text-text-muted">{fullReport.stats.unsupported}</div>
                  <div className="text-[10px] text-text-muted">UNSUPPORTED</div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">All Diagnostic Test Results</h2>
                <p className="text-xs text-text-muted mt-1">
                  Every inspected module and its recorded outcome.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(fullReport.tests).map((test) => {
                  const status = getStatusStyle(test.status);
                  const StatusIcon = status.icon;
                  const isGps = test.id === 'gps';

                  return (
                    <div key={test.id} className="p-4 rounded-2xl glass-panel border border-bg-border space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isGps && <MapPin className="w-4 h-4 text-accent-cyan" />}
                          <h3 className="text-sm font-bold">{test.title}</h3>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-mono font-bold ${status.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>

                      <p className="text-xs text-text-muted font-mono leading-relaxed">
                        {test.details || 'No additional diagnostic details recorded.'}
                      </p>

                      {test.userNotes && (
                        <div className="pt-2 border-t border-bg-border text-[11px] text-text-dim">
                          Inspector note: {test.userNotes}
                        </div>
                      )}

                      {isGps && test.data?.accuracy !== undefined && (
                        <div className="text-[10px] text-accent-cyan font-mono">
                          GPS accuracy recorded: ±{Math.round(Number(test.data.accuracy))} m
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="p-6 rounded-3xl glass-panel border border-bg-border space-y-4">
              <h2 className="text-lg font-bold">Trust Score Breakdown</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.values(fullReport.categoryScores).map((category) => (
                  <div key={category.category} className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
                    <span className="text-[10px] text-text-dim font-mono">{category.weight}% WEIGHT</span>
                    <h3 className="text-sm font-bold mt-1">{category.name}</h3>
                    <div className="mt-3 flex items-end justify-between">
                      <span className="text-2xl font-extrabold text-accent-teal font-mono">{category.score}</span>
                      <span className="text-[10px] text-text-muted font-mono">/ 100</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {fullReport.physicalInspection && (
              <section className="p-6 rounded-3xl glass-panel border border-bg-border space-y-4">
                <h2 className="text-lg font-bold">Physical Condition Inspection</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  {[
                    ['Screen Glass', fullReport.physicalInspection.screenGlass],
                    ['Body / Frame', fullReport.physicalInspection.bodyFrame],
                    ['Camera Lens', fullReport.physicalInspection.cameraLens],
                    ['Charging Port', fullReport.physicalInspection.chargingPort],
                    ['Power Button', fullReport.physicalInspection.powerButton],
                    ['Volume Buttons', fullReport.physicalInspection.volumeButtons],
                    ['SIM Tray', fullReport.physicalInspection.simTray],
                    ['Back Panel', fullReport.physicalInspection.backPanel],
                  ].map(([label, value]) => (
                    <div key={label} className="p-3 rounded-xl bg-bg-darker border border-bg-border">
                      <span className="text-[10px] text-text-dim block">{label.toUpperCase()}</span>
                      <span className="text-white font-bold">{value}</span>
                    </div>
                  ))}
                </div>

                {fullReport.physicalInspection.notes && (
                  <div className="p-3 rounded-xl bg-white/5 border border-bg-border text-xs text-text-muted">
                    Notes: {fullReport.physicalInspection.notes}
                  </div>
                )}
              </section>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl glass-panel border border-status-warning/20">
                <h2 className="text-sm font-bold text-status-warning mb-3">Warnings / Observations</h2>
                {fullReport.warnings.length > 0 ? (
                  <ul className="space-y-2 text-xs text-text-muted">
                    {fullReport.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-text-muted">No warnings were recorded.</p>
                )}
              </div>

              <div className="p-5 rounded-2xl glass-panel border border-accent-teal/20">
                <h2 className="text-sm font-bold text-accent-teal mb-3">Recommendations</h2>
                <ul className="space-y-2 text-xs text-text-muted">
                  {fullReport.recommendations.map((recommendation, index) => (
                    <li key={index}>• {recommendation}</li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        ) : (
          <section className="p-6 rounded-3xl glass-panel border border-status-warning/30 text-center">
            <p className="text-sm text-status-warning font-bold">Detailed inspection data is unavailable for this older report.</p>
            <p className="text-xs text-text-muted mt-2">
              New reports will include the complete module-by-module inspection result when their QR code is scanned.
            </p>
          </section>
        )}

        <p className="text-[10px] leading-relaxed text-text-dim text-center px-4">
          Verification confirms that this report ID exists in the AuthentiX diagnostic system. For privacy, the public QR view shows the GPS test result and accuracy but does not publish exact latitude/longitude coordinates. It does not independently guarantee device ownership, manufacturer authenticity, or absence of undiscovered hardware faults.
        </p>
      </main>
    </div>
  );
};
