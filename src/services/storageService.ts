import { User, AuthSession, OtpState, LoginAttemptState } from '../types/auth';
import { DiagnosticReport } from '../types/diagnostic';

const USERS_KEY = 'authentix_users';
const SESSION_KEY = 'authentix_session';
const OTP_KEY = 'authentix_otp_state';
const LOGIN_ATTEMPTS_KEY = 'authentix_login_attempts';
const REPORTS_KEY = 'authentix_reports';
const ACTIVE_INSPECTION_KEY = 'authentix_active_inspection';
const SETTINGS_KEY = 'authentix_settings';

export interface AppSettings {
  reducedMotion: boolean;
  highContrast: boolean;
  soundEffects: boolean;
  autoSaveReports: boolean;
}

export const StorageService = {
  getUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const defaultUsers: User[] = [
        {
          id: 'usr_demo',
          name: 'Demo User',
          email: 'demo@authentix.tech',
          role: 'Prototype Tester',
          isEmailVerified: true,
          isDemo: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        }
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  findUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getSession(): AuthSession | null {
    const local = localStorage.getItem(SESSION_KEY);
    const sessionStr = local || sessionStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    try {
      const session: AuthSession = JSON.parse(sessionStr);
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  saveSession(session: AuthSession): void {
    const str = JSON.stringify(session);
    if (session.rememberMe) {
      localStorage.setItem(SESSION_KEY, str);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, str);
      localStorage.removeItem(SESSION_KEY);
    }
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  },

  getOtpState(): OtpState | null {
    const raw = sessionStorage.getItem(OTP_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveOtpState(state: OtpState): void {
    sessionStorage.setItem(OTP_KEY, JSON.stringify(state));
  },

  clearOtpState(): void {
    sessionStorage.removeItem(OTP_KEY);
  },

  getLoginAttempts(email: string): LoginAttemptState {
    const raw = localStorage.getItem(`${LOGIN_ATTEMPTS_KEY}_${email.toLowerCase()}`);
    if (!raw) return { failedAttempts: 0, lockedUntil: null };
    try {
      const state: LoginAttemptState = JSON.parse(raw);
      if (state.lockedUntil && Date.now() > state.lockedUntil) {
        return { failedAttempts: 0, lockedUntil: null };
      }
      return state;
    } catch {
      return { failedAttempts: 0, lockedUntil: null };
    }
  },

  recordFailedLogin(email: string): LoginAttemptState {
    const current = this.getLoginAttempts(email);
    const failedAttempts = current.failedAttempts + 1;
    let lockedUntil: number | null = null;
    
    if (failedAttempts >= 5) {
      lockedUntil = Date.now() + 5 * 60 * 1000;
    }
    
    const state: LoginAttemptState = { failedAttempts, lockedUntil };
    localStorage.setItem(`${LOGIN_ATTEMPTS_KEY}_${email.toLowerCase()}`, JSON.stringify(state));
    return state;
  },

  resetLoginAttempts(email: string): void {
    localStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${email.toLowerCase()}`);
  },

  // Reports
  getReports(): DiagnosticReport[] {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveReport(report: DiagnosticReport): void {
    const reports = this.getReports();
    const existingIndex = reports.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      reports[existingIndex] = report;
    } else {
      reports.unshift(report);
    }
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  },

  deleteReport(id: string): void {
    const reports = this.getReports().filter(r => r.id !== id);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  },

  getReportById(id: string): DiagnosticReport | undefined {
    return this.getReports().find(r => r.id === id);
  },

  // Active Inspection Persistence (for reload safety)
  getActiveInspection<T>(): T | null {
    const raw = localStorage.getItem(ACTIVE_INSPECTION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveActiveInspection<T>(data: T): void {
    localStorage.setItem(ACTIVE_INSPECTION_KEY, JSON.stringify(data));
  },

  clearActiveInspection(): void {
    localStorage.removeItem(ACTIVE_INSPECTION_KEY);
  },

  getSettings(): AppSettings {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {
        reducedMotion: false,
        highContrast: false,
        soundEffects: true,
        autoSaveReports: true,
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { reducedMotion: false, highContrast: false, soundEffects: true, autoSaveReports: true };
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
