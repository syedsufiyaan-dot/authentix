import { getPiLiveDiagnostic, isPiAutoMode, type PiLiveDiagnostic } from './piAutoDiagnosticService';

const PANEL_ID = 'authentix-pi-auto-status';
const EVENT_NAME = 'authentix:pi-live-diagnostic';

function formatNumber(value: number | undefined, digits = 1): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '—';
}

function ensurePanel(): HTMLDivElement {
  let panel = document.getElementById(PANEL_ID) as HTMLDivElement | null;
  if (panel) return panel;

  panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.style.position = 'fixed';
  panel.style.left = '12px';
  panel.style.right = '12px';
  panel.style.bottom = '12px';
  panel.style.zIndex = '99999';
  panel.style.padding = '12px 14px';
  panel.style.borderRadius = '14px';
  panel.style.background = 'rgba(4, 12, 20, 0.94)';
  panel.style.border = '1px solid rgba(45, 212, 191, 0.45)';
  panel.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';
  panel.style.color = '#ffffff';
  panel.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  panel.style.fontSize = '12px';
  panel.style.lineHeight = '1.45';
  panel.style.backdropFilter = 'blur(10px)';
  panel.innerHTML = '<strong style="color:#2dd4bf">AUTHENTIX AUTO MODE</strong><br>Connecting to Raspberry Pi…';
  document.body.appendChild(panel);
  return panel;
}

function renderDiagnostic(data: PiLiveDiagnostic): void {
  const panel = ensurePanel();
  const device = data.device;
  const battery = device?.battery;
  const power = data.power;

  const deviceLine = device?.connected
    ? `${device.manufacturer || 'Android'} ${device.model || ''} • Android ${device.android_version || '—'}`
    : 'No authorized Android device detected';

  const batteryLine = battery
    ? `Battery ${battery.level ?? '—'}% • ${battery.charging ? 'Charging' : 'Not charging'} • ${formatNumber(battery.temperature_c)}°C`
    : 'Battery telemetry unavailable';

  const hasPower = power && power.available !== false && typeof power.bus_voltage_v === 'number';
  const powerLine = hasPower
    ? `USB ${formatNumber(power.bus_voltage_v, 3)} V • ${formatNumber(power.current_a, 3)} A • ${formatNumber(power.power_w, 3)} W`
    : `Charging sensor: ${power?.error ? 'unavailable' : 'waiting for INA219'}`;

  panel.innerHTML = [
    '<strong style="color:#2dd4bf">AUTHENTIX AUTO MODE • LIVE</strong>',
    `<div style="margin-top:4px">${deviceLine}</div>`,
    `<div>${batteryLine}</div>`,
    `<div>${powerLine}</div>`,
    '<div style="margin-top:4px;color:#94a3b8;font-size:11px">Objective checks run automatically. Display, touch, camera quality, audio quality and physical-condition checks still require user interaction.</div>',
  ].join('');
}

function renderError(message: string): void {
  const panel = ensurePanel();
  panel.innerHTML = [
    '<strong style="color:#f59e0b">AUTHENTIX AUTO MODE</strong>',
    '<div style="margin-top:4px">Raspberry Pi backend is not responding.</div>',
    `<div style="color:#94a3b8;font-size:11px">${message}</div>`,
  ].join('');
}

export function installPiAutoStatusRuntime(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !isPiAutoMode()) return;

  let stopped = false;

  const poll = async () => {
    if (stopped) return;

    try {
      const data = await getPiLiveDiagnostic();
      renderDiagnostic(data);
      window.dispatchEvent(new CustomEvent<PiLiveDiagnostic>(EVENT_NAME, { detail: data }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Raspberry Pi connection error';
      renderError(message);
    }
  };

  const start = () => {
    void poll();
    const timer = window.setInterval(() => void poll(), 2000);
    window.addEventListener('beforeunload', () => {
      stopped = true;
      window.clearInterval(timer);
    }, { once: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}

export const PI_LIVE_DIAGNOSTIC_EVENT = EVENT_NAME;
