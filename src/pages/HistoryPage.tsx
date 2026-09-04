import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';
import { useDiagnostic } from '../context/DiagnosticContext';
import { getGradeFromScore } from '../utils/trustScore';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';

export const HistoryPage: React.FC = () => {
  const { reports, deleteReport } = useDiagnostic();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filtered = reports.filter((r) => {
    const matchQuery =
      r.device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGrade = gradeFilter === 'ALL' || r.grade === gradeFilter;
    return matchQuery && matchGrade;
  });

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteReport(deleteTargetId);
      toast('Diagnostic report deleted.', 'info');
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Scan History
        </h1>
        <p className="text-xs text-text-muted font-mono mt-1">
          Historical diagnostic logs, Trust Score records, and exported certificates.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search device name or report ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto">
          {['ALL', 'EXCELLENT', 'GOOD', 'INSPECT', 'HIGH_RISK'].map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                gradeFilter === g
                  ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal/40'
                  : 'glass-panel text-text-muted hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl glass-panel border border-bg-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted font-mono">
            No diagnostic records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-darker/80 text-text-muted font-mono uppercase text-[10px] tracking-wider border-b border-bg-border">
                <tr>
                  <th className="py-3.5 px-4">Device</th>
                  <th className="py-3.5 px-4">Report ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Trust Score</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Test Breakdown</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border/60">
                {filtered.map((r) => {
                  const { label, color, bgClass, borderClass } = getGradeFromScore(r.overallScore);
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{r.device.deviceName}</div>
                        <div className="text-[10px] text-text-dim font-mono">{r.device.manufacturer}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-text-muted">{r.id}</td>
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
                      <td className="py-3.5 px-4 font-mono text-[11px] text-text-muted">
                        <span className="text-status-success">{r.stats.passed}P</span> •{' '}
                        <span className="text-status-warning">{r.stats.warning}W</span> •{' '}
                        <span className="text-status-critical">{r.stats.failed}F</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/app/report/${r.id}`}
                            className="px-3 py-1.5 rounded-lg glass-panel hover:border-accent-teal/50 text-accent-teal text-xs font-mono font-medium transition-all"
                          >
                            Report
                          </Link>
                          <button
                            onClick={() => setDeleteTargetId(r.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-status-critical hover:bg-status-critical/10 transition-colors"
                            title="Delete report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Confirm Report Deletion"
      >
        <div className="space-y-4 text-xs text-text-muted">
          <p>
            Are you sure you want to delete report <strong className="text-white font-mono">{deleteTargetId}</strong>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteTargetId(null)}
              className="px-4 py-2 rounded-xl glass-panel text-text-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 rounded-xl bg-status-critical text-white font-bold hover:bg-status-critical/90"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
