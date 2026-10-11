export interface PowerMetrics {
  bus_voltage_v: number;
  shunt_voltage_mv: number;
  current_ma: number;
  current_a: number;
  power_mw: number;
  power_w: number;
}

interface PowerResponse {
  success: boolean;
  data?: PowerMetrics;
  error?: string;
}

function getPiApiUrl(): string {
  const configured =
    (import.meta.env.VITE_PI_API_URL as string | undefined)?.replace(/\/$/, '');

  if (configured) return configured;

  const params = new URLSearchParams(window.location.search);

  // In automatic station mode the AuthentiX browser is running on the Pi,
  // so localhost is the most reliable backend address even if DHCP changes.
  if (params.get('auto') === '1') {
    return 'http://127.0.0.1:5000';
  }

  return 'https://10.52.123.159:5000';
}

export async function getPowerMetrics(): Promise<PowerMetrics> {
  const response = await fetch(`${getPiApiUrl()}/api/power`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Raspberry Pi power API returned HTTP ${response.status}.`);
  }

  const result = (await response.json()) as PowerResponse;

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Unable to read charging power metrics.');
  }

  return result.data;
}
