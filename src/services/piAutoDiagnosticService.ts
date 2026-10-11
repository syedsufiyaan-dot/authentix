export interface PiBatteryInfo {
  level?: number;
  battery_voltage_v?: number;
  temperature_c?: number;
  health?: number;
  status?: number;
  usb_powered?: boolean;
  charging?: boolean;
}

export interface PiDeviceInfo {
  connected: boolean;
  serial?: string;
  manufacturer?: string;
  model?: string;
  android_version?: string;
  battery?: PiBatteryInfo;
  error?: string;
}

export interface PiPowerMetrics {
  bus_voltage_v?: number;
  shunt_voltage_mv?: number;
  current_ma?: number;
  current_a?: number;
  power_mw?: number;
  power_w?: number;
  available?: boolean;
  error?: string;
}

export interface PiLiveDiagnostic {
  device: PiDeviceInfo;
  power: PiPowerMetrics | null;
}

interface PiLiveResponse {
  success: boolean;
  data?: PiLiveDiagnostic;
  error?: string;
}

const PI_STATION_SESSION_KEY = 'authentix_pi_station_mode';

function getPiApiUrl(): string {
  const configured = (import.meta.env.VITE_PI_API_URL as string | undefined)?.replace(/\/$/, '');
  if (configured) return configured;
  return 'http://127.0.0.1:5000';
}

export async function getPiLiveDiagnostic(): Promise<PiLiveDiagnostic> {
  const baseUrl = getPiApiUrl();
  const response = await fetch(`${baseUrl}/api/diagnostic/live`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Raspberry Pi diagnostic API returned HTTP ${response.status}.`);
  }

  const result = (await response.json()) as PiLiveResponse;

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Unable to read Raspberry Pi diagnostic data.');
  }

  return result.data;
}

export function isPiAutoMode(): boolean {
  if (typeof window === 'undefined') return false;

  const requested = new URLSearchParams(window.location.search).get('auto') === '1';
  if (requested) {
    try {
      sessionStorage.setItem(PI_STATION_SESSION_KEY, '1');
    } catch {
      // Ignore storage restrictions; query mode still works for this page load.
    }
    return true;
  }

  try {
    return sessionStorage.getItem(PI_STATION_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearPiAutoMode(): void {
  try {
    sessionStorage.removeItem(PI_STATION_SESSION_KEY);
  } catch {
    // Ignore storage restrictions.
  }
}
