import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ScanLine, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  Smartphone, 
  ArrowUpRight, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { PhoneModel3D } from '../components/three/PhoneModel3D';
import { useDiagnostic } from '../context/DiagnosticContext';
import { getGradeFromScore } from '../utils/trustScore';
import { DisclaimerBadge } from '../components/common/DisclaimerBadge';

export const DashboardPage: React.FC = () => {
  const { reports } = useDiagnostic();

  const totalScans = reports.length;
  const avgScore = totalScans > 0 
    ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / totalScans) 
    : 0;
  const healthyCount = reports.filter((r) => r.overallScore >= 75).length;
  const warningCount = reports.filter((r) => r.overallScore < 75).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto select-none pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Device Intelligence Center
          </h1>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Analyze device health, review step-by-step diagnostics, and generate transparent Trust Scores.
          </p>
        </div>

        <Link
          to="/app/diagnostic"
          className="px-5 py-3 rounded-xl bg-accent-teal text-bg-darkest font-bold text-xs font-mono tracking-wider uppercase hover:bg-accent-teal/90 transition-all shadow-teal-glow flex items-center gap-2 self-start"
        >
          <ScanLine className="w-4 h-4" />
          <span>Start New Inspection</span>
        </Link>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Total Inspections</span>
            <Smartphone className="w-4 h-4 text-accent-teal" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalScans}</div>
          <div className="text-[11px] text-accent-teal flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3 h-3" /> Historical telemetry
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Average Trust Score</span>
            <BarChart3 className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{avgScore} <span className="text-xs text-text-muted font-normal">/ 100</span></div>
          <div className="text-[11px] text-accent-cyan font-mono">Good Condition Mean</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Healthy Devices</span>
            <ShieldCheck className="w-4 h-4 text-status-success" />
          </div>
          <div className="text-3xl font-extrabold text-status-success font-mono">{healthyCount}</div>
          <div className="text-[11px] text-text-muted font-mono">&gt;= 75 Trust Score</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Warnings Flagged</span>
            <AlertTriangle className="w-4 h-4 text-status-warning" />
          </div>
          <div className="text-3xl font-extrabold text-status-warning font-mono">{warningCount}</div>
          <div className="text-[11px] text-text-muted font-mono">&lt; 75 Inspection Need</div>
        </div>
      </div>

      {/* Main Feature Area: 3D Visualization + Quick Scan Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 h-[360px] md:h-[420px] rounded-3xl glass-panel-glow border border-accent-teal/25 p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-teal animate-pulse" />
              <span className="text-xs font-mono text-white font-bold tracking-wider">
                AUTHENTIX INSPECTION WORKSTATION
              </span>
            </div>
            <DisclaimerBadge type="browser" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <PhoneModel3D isScanning={true} />
          </div>

          <div className="z-10 flex items-center justify-between text-[11px] font-mono text-text-muted border-t border-white/5 pt-2">
            <span>INTERACTIVE TESTING ENGINE</span>
            <span>16 HARDWARE MODULES</span>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-accent-cyan/20">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
              <Zap className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Interactive Mobile Inspection</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Run step-by-step diagnostics for Display dead pixels, Touch coverage, Dual Cameras, Microphone recording, Audio chimes, Vibration, Storage, and Sensors.
              </p>
            </div>

            <Link
              to="/app/diagnostic"
              className="w-full py-3 rounded-xl bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/30 text-accent-cyan font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span>Launch 16-Step Wizard</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border text-xs text-text-muted space-y-1">
            <span className="font-semibold text-white">AuthentiX Quality Standard:</span>
            <p className="text-[11px] leading-relaxed">
              Transparent, repeatable tests designed for smartphone buyers, refurbishment centers, and trade-in evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Diagnostics Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide">Recent Diagnostics</h3>
          <Link
            to="/app/history"
            className="text-xs font-mono text-accent-teal hover:underline flex items-center gap-1"
          >
            View All Scans ?
          </Link>
        </div>

        <div className="rounded-2xl glass-panel border border-bg-border overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-muted font-mono">
              No previous inspection reports found. Launch your first diagnostic!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-darker/80 text-text-muted font-mono uppercase text-[10px] tracking-wider border-b border-bg-border">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Device</th>
                    <th className="py-3.5 px-4 font-semibold">Inspection Date</th>
                    <th className="py-3.5 px-4 font-semibold">Trust Score</th>
                    <th className="py-3.5 px-4 font-semibold">Condition Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border/60">
                  {reports.slice(0, 5).map((r) => {
                    const { label, color, bgClass, borderClass } = getGradeFromScore(r.overallScore);
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{r.device.deviceName}</div>
                          <div className="text-[10px] text-text-dim font-mono">{r.id}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-text-muted">
                          {new Date(r.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-base font-extrabold font-mono" style={{ color }}>
                            {r.overallScore}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono"> / 100</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-medium border ${bgClass} ${borderClass}`}>
                            {label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/app/report/${r.id}`}
                            className="px-3 py-1.5 rounded-lg glass-panel hover:border-accent-teal/50 text-accent-teal text-xs font-mono font-medium transition-all"
                          >
                            View Report
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


