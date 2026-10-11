import { getPiLiveDiagnostic, isPiAutoMode, type PiLiveDiagnostic } from './piAutoDiagnosticService';

const PANEL_ID = 'authentix-pi-auto-status';
const EVENT_NAME = 'authentix:pi-live-diagnostic';
const ACTIVE_INSPECTION_KEY = 'authentix_active_inspection';
const AUTO_RELOAD_KEY = 'authentix_auto_results_reloaded';

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

type AutoStatus = 'PASSED' | 'WARNING' | 'FAILED';

interface AutoResult {
  status: AutoStatus;
  details: string;
  data?: Record<string, unknown>;
}

function classifyDevice(data: PiLiveDiagnostic): AutoResult {
  const device = data.device;
  if (!device?.connected) {
    return {
      status: 'WARNING',
      details: 'No authorized Android device detected by Raspberry Pi ADB.',
    };
  }

  return {
    status: 'PASSED',
    details: `ADB verified ${device.manufacturer || 'Android'} ${device.model || ''} • Android ${device.android_version || 'unknown'} • Serial ${device.serial || 'unavailable'}`,
    data: {
      source: 'raspberry-pi-adb',
      manufacturer: device.manufacturer,
      model: device.model,
      androidVersion: device.android_version,
      serial: device.serial,
    },
  };
}

function classifyBattery(data: PiLiveDiagnostic): AutoResult {
  const battery = data.device?.battery;
  const power = data.power;

  if (!battery) {
    return {
      status: 'WARNING',
      details: 'ADB battery telemetry is unavailable.',
    };
  }

  const temperature = battery.temperature_c;
  if (typeof temperature === 'number' && temperature >= 50) {
    return {
      status: 'FAILED',
      details: `Battery temperature is critically high at ${temperature.toFixed(1)}°C.`,
    };
  }

  if (typeof temperature === 'number' && temperature >= 45) {
    return {
      status: 'WARNING',
      details: `Battery temperature is elevated at ${temperature.toFixed(1)}°C. Charging state: ${battery.charging ? 'active' : 'inactive'}.`,
    };
  }

  const voltage = power?.bus_voltage_v;
  const current = power?.current_a;
  const powerW = power?.power_w;
  const hasUsableInaReading =
    power?.available !== false &&
    typeof voltage === 'number' &&
    typeof current === 'number' &&
    voltage >= 4.5 &&
    voltage <= 5.25 &&
    current > 0.05;

  if (battery.charging && battery.usb_powered && hasUsableInaReading) {
    return {
      status: 'PASSED',
      details: `USB charging verified by ADB and INA219: ${voltage!.toFixed(3)} V • ${current!.toFixed(3)} A • ${typeof powerW === 'number' ? powerW.toFixed(3) : '—'} W • Battery ${battery.level ?? '—'}% • ${formatNumber(temperature)}°C`,
      data: {
        source: 'adb+ina219',
        batteryLevel: battery.level,
        charging: battery.charging,
        usbPowered: battery.usb_powered,
        temperatureC: temperature,
        busVoltageV: voltage,
        currentA: current,
        powerW,
      },
    };
  }

  if (battery.charging && battery.usb_powered) {
    return {
      status: 'WARNING',
      details: `ADB confirms USB charging, but INA219 is not yet measuring a valid 5 V charging path. Current sensor reading: ${formatNumber(voltage, 3)} V • ${formatNumber(current, 3)} A.`,
      data: {
        source: 'adb',
        batteryLevel: battery.level,
        charging: battery.charging,
        usbPowered: battery.usb_powered,
        temperatureC: temperature,
        busVoltageV: voltage,
        currentA: current,
        powerW,
      },
    };
  }

  return {
    status: 'WARNING',
    details: `Phone is detected, but active USB charging was not confirmed. Battery ${battery.level ?? '—'}% • ${formatNumber(temperature)}°C.`,
    data: {
      source: 'adb',
      batteryLevel: battery.level,
      charging: battery.charging,
      usbPowered: battery.usb_powered,
      temperatureC: temperature,
    },
  };
}

function classifyNetwork(): AutoResult {
  return navigator.onLine
    ? { status: 'PASSED', details: 'Browser network connectivity is online during automatic diagnostic mode.', data: { online: true } }
    : { status: 'WARNING', details: 'Browser reports that network connectivity is offline.', data: { online: false } };
}

function saveAutoResults(data: PiLiveDiagnostic): boolean {
  try {
    const raw = localStorage.getItem(ACTIVE_INSPECTION_KEY);
    if (!raw) return false;

    const inspection = JSON.parse(raw) as {
      step?: number;
      tests?: Record<string, Record<string, unknown>>;
      physical?: unknown;
    };

    if (!inspection.tests) return false;

    const autoResults: Record<string, AutoResult> = {
      device_info: classifyDevice(data),
      battery: classifyBattery(data),
      network: classifyNetwork(),
    };

    let changed = false;
    const now = new Date().toISOString();

    for (const [id, result] of Object.entries(autoResults)) {
      const existing = inspection.tests[id];
      if (!existing) continue;

      if (existing.status !== result.status || existing.details !== result.details) {
        inspection.tests[id] = {
          ...existing,
          status: result.status,
          details: result.details,
          data: result.data,
          testedAt: now,
        };
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(ACTIVE_INSPECTION_KEY, JSON.stringify(inspection));
    }

    return changed;
  } catch {
    return false;
  }
}

function statusLabel(result: AutoResult): string {
  if (result.status === 'PASSED') return 'PASS';
  if (result.status === 'FAILED') return 'FAIL';
  return 'CHECK';
}

function statusColor(result: AutoResult): string {
  if (result.status === 'PASSED') return '#2dd4bf';
  if (result.status === 'FAILED') return '#f87171';
  return '#f59e0b';
}

function renderDiagnostic(data: PiLiveDiagnostic): void {
  const panel = ensurePanel();
  const device = data.device;
  const battery = device?.battery;
  const power = data.power;

  const deviceResult = classifyDevice(data);
  const batteryResult = classifyBattery(data);
  const networkResult = classifyNetwork();

  const deviceLine = device?.connected
    ? `${device.manufacturer || 'Android'} ${device.model || ''} • Android ${device.android_version || '—'}`
    : 'No authorized Android device detected';

  const batteryLine = battery
    ? `Battery ${battery.level ?? '—'}% • ${battery.charging ? 'Charging' : 'Not charging'} • ${formatNumber(battery.temperature_c)}°C`
    : 'Battery telemetry unavailable';

  const hasPower = power && power.available !== false && typeof power.bus_voltage_v === 'number';
  const powerLine = hasPower
    ? `INA219 ${formatNumber(power.bus_voltage_v, 3)} V • ${formatNumber(power.current_a, 3)} A • ${formatNumber(power.power_w, 3)} W`
    : `Charging sensor: ${power?.error ? 'unavailable' : 'waiting for INA219'}`;

  panel.innerHTML = [
    '<strong style="color:#2dd4bf">AUTHENTIX AUTO MODE • LIVE</strong>',
    `<div style="margin-top:4px">${deviceLine}</div>`,
    `<div>${batteryLine}</div>`,
    `<div>${powerLine}</div>`,
    `<div style="margin-top:7px"><span style="color:${statusColor(deviceResult)}">DEVICE ${statusLabel(deviceResult)}</span> • <span style="color:${statusColor(batteryResult)}">CHARGING ${statusLabel(batteryResult)}</span> • <span style="color:${statusColor(networkResult)}">NETWORK ${statusLabel(networkResult)}</span></div>`,
    '<div style="margin-top:4px;color:#94a3b8;font-size:11px">Automatic results are saved into the diagnostic test cards. Display, touch, camera quality, audio quality and physical-condition checks still require user interaction.</div>',
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
      const changed = saveAutoResults(data);
      window.dispatchEvent(new CustomEvent<PiLiveDiagnostic>(EVENT_NAME, { detail: data }));

      // The diagnostic page restores its test state from localStorage. Reload once
      // after the first automatic result set so the visible cards immediately show
      // PASSED/WARNING/FAILED without replacing any of the existing React workflow.
      if (changed && sessionStorage.getItem(AUTO_RELOAD_KEY) !== '1') {
        sessionStorage.setItem(AUTO_RELOAD_KEY, '1');
        window.setTimeout(() => window.location.reload(), 250);
      }
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
