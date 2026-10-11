import { getPiLiveDiagnostic, isPiAutoMode, type PiLiveDiagnostic } from './piAutoDiagnosticService';

const PANEL_ID = 'authentix-pi-auto-status';
const EVENT_NAME = 'authentix:pi-live-diagnostic';
const ACTIVE_INSPECTION_KEY = 'authentix_active_inspection';

const STEP_IDS = [
  'device_info',
  'display',
  'touch',
  'front_camera',
  'rear_camera',
  'mic',
  'speaker',
  'vibration',
  'storage',
  'network',
  'bluetooth',
  'gps',
  'motion',
  'battery',
  'hardware',
  'physical',
] as const;

const STEP_TITLES: Record<(typeof STEP_IDS)[number], string> = {
  device_info: 'Device Information',
  display: 'Display Test',
  touch: 'Touch Screen Test',
  front_camera: 'Front Camera Test',
  rear_camera: 'Rear Camera Test',
  mic: 'Microphone Test',
  speaker: 'Speaker / Audio Test',
  vibration: 'Vibration Test',
  storage: 'Storage Capability Test',
  network: 'Internet / Network Test',
  bluetooth: 'Bluetooth Capability Test',
  gps: 'GPS / Location Test',
  motion: 'Motion & Orientation Sensor Test',
  battery: 'Battery / Charging Test',
  hardware: 'Hardware Capability Test',
  physical: 'Physical Condition Inspection',
};

const MANUAL_STEPS = new Set<(typeof STEP_IDS)[number]>([
  'display',
  'touch',
  'front_camera',
  'rear_camera',
  'mic',
  'speaker',
  'vibration',
  'physical',
]);

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

type AutoStatus = 'PASSED' | 'WARNING' | 'FAILED' | 'UNSUPPORTED';

interface AutoResult {
  status: AutoStatus;
  details: string;
  data?: Record<string, unknown>;
}

interface ActiveInspection {
  step?: number;
  tests?: Record<string, Record<string, unknown>>;
  physical?: unknown;
}

function readInspection(): ActiveInspection | null {
  try {
    const raw = localStorage.getItem(ACTIVE_INSPECTION_KEY);
    return raw ? (JSON.parse(raw) as ActiveInspection) : null;
  } catch {
    return null;
  }
}

function writeInspection(inspection: ActiveInspection): void {
  localStorage.setItem(ACTIVE_INSPECTION_KEY, JSON.stringify(inspection));
}

function isCompleteStatus(status: unknown): boolean {
  return typeof status === 'string' && !['NOT_TESTED', 'IN_PROGRESS'].includes(status);
}

function writeResult(id: string, result: AutoResult): boolean {
  const inspection = readInspection();
  if (!inspection?.tests?.[id]) return false;

  const existing = inspection.tests[id];
  inspection.tests[id] = {
    ...existing,
    status: result.status,
    details: result.details,
    data: result.data,
    testedAt: new Date().toISOString(),
  };
  writeInspection(inspection);
  return true;
}

function moveToStep(step: number): void {
  const inspection = readInspection();
  if (!inspection) return;
  inspection.step = Math.max(0, Math.min(16, step));
  writeInspection(inspection);
  window.setTimeout(() => window.location.reload(), 180);
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

async function classifyStorage(): Promise<AutoResult> {
  if (!navigator.storage?.estimate) {
    return { status: 'UNSUPPORTED', details: 'Browser StorageManager estimate API is unavailable.' };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const quota = estimate.quota || 0;
    const usage = estimate.usage || 0;
    if (quota <= 0) {
      return { status: 'WARNING', details: 'Storage API responded but did not expose a usable quota.' };
    }

    return {
      status: 'PASSED',
      details: `Browser storage capability verified • Quota ${(quota / 1073741824).toFixed(2)} GB • Used ${(usage / 1073741824).toFixed(2)} GB.`,
      data: { quotaBytes: quota, usageBytes: usage },
    };
  } catch (error) {
    return {
      status: 'WARNING',
      details: `Storage capability check could not complete: ${error instanceof Error ? error.message : 'unknown error'}`,
    };
  }
}

function classifyBluetooth(): AutoResult {
  if ('bluetooth' in navigator) {
    return {
      status: 'WARNING',
      details: 'Web Bluetooth capability is exposed. Browser security requires a user gesture for real adapter/device discovery, so hardware discovery is not auto-passed.',
      data: { webBluetoothApi: true },
    };
  }

  return {
    status: 'UNSUPPORTED',
    details: 'Web Bluetooth API is not exposed by this browser.',
    data: { webBluetoothApi: false },
  };
}

async function classifyGps(): Promise<AutoResult> {
  if (!navigator.geolocation) {
    return { status: 'UNSUPPORTED', details: 'Geolocation API is unavailable in this browser.' };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = Math.round(position.coords.accuracy);
        resolve({
          status: accuracy <= 50 ? 'PASSED' : 'WARNING',
          details: `GPS/location fix acquired automatically • Accuracy ±${accuracy} meters.`,
          data: {
            accuracy,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        resolve({
          status: 'WARNING',
          details: `Automatic GPS/location check could not obtain a fix: ${error.message}`,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

async function classifyMotion(): Promise<AutoResult> {
  if (!('DeviceOrientationEvent' in window)) {
    return { status: 'UNSUPPORTED', details: 'Device orientation API is not available.' };
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: AutoResult) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('deviceorientation', onOrientation);
      resolve(result);
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
        finish({
          status: 'PASSED',
          details: `Motion/orientation telemetry detected • α ${Math.round(event.alpha || 0)}° • β ${Math.round(event.beta || 0)}° • γ ${Math.round(event.gamma || 0)}°`,
          data: { alpha: event.alpha, beta: event.beta, gamma: event.gamma },
        });
      }
    };

    window.addEventListener('deviceorientation', onOrientation);
    window.setTimeout(() => {
      finish({
        status: 'WARNING',
        details: 'No orientation event was received during the automatic sampling window. The browser may require sensor permission or physical movement.',
      });
    }, 4500);
  });
}

function classifyHardware(): AutoResult {
  const cores = navigator.hardwareConcurrency || 0;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (cores > 0 && gl) {
    return {
      status: 'PASSED',
      details: `Hardware capability check completed • ${cores} logical CPU threads • WebGL graphics context available.`,
      data: { logicalThreads: cores, webgl: true },
    };
  }

  return {
    status: 'WARNING',
    details: `Hardware capability is partially restricted by the browser • CPU threads ${cores || 'unavailable'} • WebGL ${gl ? 'available' : 'unavailable'}.`,
    data: { logicalThreads: cores, webgl: Boolean(gl) },
  };
}

async function resultForAutoStep(id: (typeof STEP_IDS)[number], data: PiLiveDiagnostic): Promise<AutoResult | null> {
  switch (id) {
    case 'device_info':
      return classifyDevice(data);
    case 'storage':
      return classifyStorage();
    case 'network':
      return classifyNetwork();
    case 'bluetooth':
      return classifyBluetooth();
    case 'gps':
      return classifyGps();
    case 'motion':
      return classifyMotion();
    case 'battery':
      return classifyBattery(data);
    case 'hardware':
      return classifyHardware();
    default:
      return null;
  }
}

function statusLabel(result: AutoResult): string {
  if (result.status === 'PASSED') return 'PASS';
  if (result.status === 'FAILED') return 'FAIL';
  if (result.status === 'UNSUPPORTED') return 'UNSUPPORTED';
  return 'CHECK';
}

function statusColor(result: AutoResult): string {
  if (result.status === 'PASSED') return '#2dd4bf';
  if (result.status === 'FAILED') return '#f87171';
  if (result.status === 'UNSUPPORTED') return '#94a3b8';
  return '#f59e0b';
}

function renderDiagnostic(data: PiLiveDiagnostic, flowMessage?: string): void {
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
    '<strong style="color:#2dd4bf">AUTHENTIX AUTO MODE • 16-STEP FLOW</strong>',
    `<div style="margin-top:4px">${deviceLine}</div>`,
    `<div>${batteryLine}</div>`,
    `<div>${powerLine}</div>`,
    `<div style="margin-top:7px"><span style="color:${statusColor(deviceResult)}">DEVICE ${statusLabel(deviceResult)}</span> • <span style="color:${statusColor(batteryResult)}">CHARGING ${statusLabel(batteryResult)}</span> • <span style="color:${statusColor(networkResult)}">NETWORK ${statusLabel(networkResult)}</span></div>`,
    flowMessage ? `<div style="margin-top:7px;color:#e2e8f0">${flowMessage}</div>` : '',
    '<div style="margin-top:4px;color:#94a3b8;font-size:11px">Automatic checks advance themselves. Visual/physical-quality checks pause for your confirmation, then Auto Mode continues to the next test.</div>',
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

function currentFlowMessage(): string | undefined {
  const inspection = readInspection();
  if (!inspection) return 'Preparing diagnostic session…';
  const step = typeof inspection.step === 'number' ? inspection.step : 0;
  if (step >= STEP_IDS.length) return 'All 16 checks visited • Final Review & Report is ready.';
  const id = STEP_IDS[step];
  return `Step ${step + 1}/16 • ${STEP_TITLES[id]}${MANUAL_STEPS.has(id) ? ' • waiting for your confirmation' : ' • automatic check running'}`;
}

export function installPiAutoStatusRuntime(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !isPiAutoMode()) return;

  let stopped = false;
  let flowBusy = false;

  const runFlow = async (data: PiLiveDiagnostic) => {
    if (flowBusy || !window.location.pathname.includes('/app/diagnostic')) return;

    const inspection = readInspection();
    if (!inspection?.tests) return;

    const step = typeof inspection.step === 'number' ? inspection.step : 0;
    if (step >= STEP_IDS.length) return;

    const id = STEP_IDS[step];
    const existingStatus = inspection.tests[id]?.status;

    if (MANUAL_STEPS.has(id)) {
      if (isCompleteStatus(existingStatus)) {
        moveToStep(step + 1);
      }
      return;
    }

    if (isCompleteStatus(existingStatus)) {
      moveToStep(step + 1);
      return;
    }

    flowBusy = true;
    try {
      const result = await resultForAutoStep(id, data);
      if (result && writeResult(id, result)) {
        moveToStep(step + 1);
      }
    } finally {
      flowBusy = false;
    }
  };

  const poll = async () => {
    if (stopped) return;

    try {
      const data = await getPiLiveDiagnostic();
      renderDiagnostic(data, currentFlowMessage());
      window.dispatchEvent(new CustomEvent<PiLiveDiagnostic>(EVENT_NAME, { detail: data }));
      await runFlow(data);
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
