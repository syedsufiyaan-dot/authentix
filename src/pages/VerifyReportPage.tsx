import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldX,
  Smartphone,
  CalendarDays,
  Gauge,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthentixLogo } from '../components/common/AuthentixLogo';
import { getGradeFromScore } from '../utils/trustScore';

interface PublicReport {
  report_code: string;
  device_name: string | null;
  manufacturer: string | null;
  trust_score: number;
  completed_at: string | null;
  status: string;
}

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
          'report_code, device_name, manufacturer, trust_score, completed_at, status'
        )
        .eq('report_code', reportId)
        .eq('status', 'completed')
        .maybeSingle();

      if (error || !data) {
        setInvalid(true);
      } else {
        setReport(data);
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
            Verifying AuthentiX Report...
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
              <h1 className="text-2xl font-extrabold">
                Report Not Verified
              </h1>

              <p className="text-sm text-text-muted mt-2">
                AuthentiX could not find a completed diagnostic report matching
                this report ID.
              </p>
            </div>

            <div className="text-xs font-mono text-text-dim">
              REPORT ID: {reportId}
            </div>

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
      <header className="px-6 py-4 border-b border-bg-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <AuthentixLogo variant="full" size={32} />

          <span className="text-[10px] font-mono text-accent-teal uppercase tracking-widest">
            Public Report Verification
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="p-8 rounded-3xl glass-panel-glow border border-accent-teal/30 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-status-success/10 border border-status-success/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-status-success" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-status-success uppercase tracking-[0.2em]">
                Verified by AuthentiX
              </span>

              <h1 className="text-2xl md:text-3xl font-extrabold mt-2">
                Authentic Diagnostic Report
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-[10px] text-text-dim font-mono">
                REPORT ID
              </span>
              <p className="text-sm font-bold font-mono mt-1">
                {report.report_code}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-[10px] text-text-dim font-mono">
                DEVICE
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Smartphone className="w-4 h-4 text-accent-teal" />
                <p className="text-sm font-bold">
                  {report.device_name || 'Unknown Device'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-[10px] text-text-dim font-mono">
                INSPECTION DATE
              </span>
              <div className="flex items-center gap-2 mt-1">
                <CalendarDays className="w-4 h-4 text-accent-cyan" />
                <p className="text-sm font-bold">
                  {report.completed_at
                    ? new Date(report.completed_at).toLocaleString()
                    : 'Not available'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
              <span className="text-[10px] text-text-dim font-mono">
                TRUST SCORE
              </span>

              <div className="flex items-center gap-2 mt-1">
                <Gauge className="w-4 h-4 text-accent-teal" />

                <span className="text-xl font-extrabold">
                  {report.trust_score}
                </span>

                <span className="text-xs text-text-muted">
                  / 100
                </span>
              </div>
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border ${grade.bgClass} ${grade.borderClass}`}
          >
            <span className="text-[10px] uppercase font-mono tracking-widest opacity-70">
              AuthentiX Final Purchase Verdict
            </span>

            <h2 className="text-lg font-extrabold mt-1">
              {verdict}
            </h2>

            <p className="text-xs text-text-muted mt-2">
              Condition classification: {grade.label}
            </p>
          </div>

          <p className="text-[10px] leading-relaxed text-text-dim text-center">
            Verification confirms that this report ID exists in the AuthentiX
            diagnostic system. It does not independently guarantee device
            ownership, manufacturer authenticity, or absence of undiscovered
            hardware faults.
          </p>
        </div>
      </main>
    </div>
  );
};
