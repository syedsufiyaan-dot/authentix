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

function getPiApiUrl(): string {
  const configured = (import.meta.env.VITE_PI_API_URL as string | undefined)?.replace(/\/$/, '');
  if (configured) return configured;

  // In ?auto=1 mode AuthentiX is opened directly on the Raspberry Pi,
  // so localhost points to the Pi backend itself.
  const params = new URLSearchParams(window.location.search);
  if (params.get('auto') === '1') {
    return 'http://127.0.0.1:5000';
  }

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
  return new URLSearchParams(window.location.search).get('auto') === '1';
}
