import { supabase } from '../lib/supabase';
import type { DiagnosticReport, TestItemResult } from '../types/diagnostic';

function getTestScore(test: TestItemResult): number {
  switch (test.status) {
    case 'PASSED':
      return 100;
    case 'WARNING':
      return 60;
    case 'FAILED':
      return 0;
    case 'UNSUPPORTED':
      return 0;
    case 'SKIPPED':
      return 0;
    default:
      return 0;
  }
}

export const SupabaseDiagnosticService = {
  async getReports(): Promise<DiagnosticReport[]> {
    const { data, error } = await supabase
      .from('diagnostic_sessions')
      .select('report_data')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? [])
      .map((row) => row.report_data as DiagnosticReport)
      .filter(Boolean);
  },

  async deleteReport(reportCode: string): Promise<void> {
    const { error } = await supabase
      .from('diagnostic_sessions')
      .delete()
      .eq('report_code', reportCode);

    if (error) {
      throw error;
    }
  },

  async saveReport(report: DiagnosticReport): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error('User must be signed in to save a diagnostic report.');
    }

    const { data: session, error: sessionError } = await supabase
      .from('diagnostic_sessions')
      .insert({
        user_id: user.id,
        report_code: report.id,
        device_name: report.device.model || report.device.manufacturer,
        device_model: report.device.model || '',
        manufacturer: report.device.manufacturer || '',
        operating_system: report.device.os || '',
        trust_score: report.overallScore,
        status: 'completed',
        report_data: report,
        completed_at: report.timestamp,
      })
      .select('id')
      .single();

    if (sessionError) {
      throw sessionError;
    }

    const results = Object.entries(report.tests).map(
      ([testKey, test]) => ({
        session_id: session.id,
        test_name: test.title || testKey,
        category: test.category || testKey,
        status: test.status,
        score: getTestScore(test),
        details: {
          key: testKey,
          title: test.title,
          details: test.details,
          raw: test,
        },
      })
    );

    if (results.length > 0) {
      const { error: resultsError } = await supabase
        .from('diagnostic_results')
        .insert(results);

      if (resultsError) {
        throw resultsError;
      }
    }
  },
};


