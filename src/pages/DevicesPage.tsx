import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, ScanLine, RotateCcw, ShieldCheck, Layers } from 'lucide-react';
import { useDiagnostic } from '../context/DiagnosticContext';
import { getGradeFromScore } from '../utils/trustScore';

export const DevicesPage: React.FC = () => {
  const { reports } = useDiagnostic();

  // Aggregate scans by device name
  const devicesMap = new Map<string, { count: number; totalScore: number; latestDate: string; manufacturer: string; lastScore: number }>();

  reports.forEach((r) => {
    const key = r.device.deviceName;
    const existing = devicesMap.get(key);
    if (existing) {
      existing.count += 1;
      existing.totalScore += r.overallScore;
      if (new Date(r.timestamp) > new Date(existing.latestDate)) {
        existing.latestDate = r.timestamp;
        existing.lastScore = r.overallScore;
      }
    } else {
      devicesMap.set(key, {
        count: 1,
        totalScore: r.overallScore,
        latestDate: r.timestamp,
        manufacturer: r.device.manufacturer,
        lastScore: r.overallScore,
      });
    }
  });

  const devicesList = Array.from(devicesMap.entries()).map(([name, data]) => ({
    name,
    manufacturer: data.manufacturer,
    count: data.count,
    avgScore: Math.round(data.totalScore / data.count),
    latestDate: data.latestDate,
    lastScore: data.lastScore,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Inspected Devices
          </h1>
          <p className="text-xs text-text-muted font-mono mt-1">
            Aggregated device profiles, average health scores, and scan history.
          </p>
        </div>

        <Link
          to="/app/diagnostic"
          className="px-4 py-2.5 rounded-xl bg-accent-teal text-bg-darkest font-bold text-xs font-mono uppercase tracking-wider hover:bg-accent-teal/90 transition-all shadow-teal-glow flex items-center gap-2 self-start"
        >
          <ScanLine className="w-4 h-4" />
          <span>New Scan</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devicesList.map((dev) => {
          const { label, color, bgClass, borderClass } = getGradeFromScore(dev.avgScore);
          return (
            <div
              key={dev.name}
              className="p-6 rounded-3xl glass-panel hover:border-accent-teal/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-medium border ${bgClass} ${borderClass}`}>
                    {label}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{dev.name}</h3>
                  <p className="text-xs text-text-dim font-mono">{dev.manufacturer}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-text-dim block text-[10px]">AVG TRUST SCORE</span>
                    <span className="text-lg font-bold" style={{ color }}>{dev.avgScore}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-text-dim block text-[10px]">TOTAL SCANS</span>
                    <span className="text-lg font-bold text-white">{dev.count}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-bg-border flex items-center justify-between">
                <span className="text-[10px] font-mono text-text-muted">
                  Last: {new Date(dev.latestDate).toLocaleDateString()}
                </span>
                <Link
                  to="/app/diagnostic"
                  className="text-xs font-mono text-accent-teal hover:underline flex items-center gap-1"
                >
                  Scan Again →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
