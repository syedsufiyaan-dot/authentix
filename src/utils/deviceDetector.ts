import { DeviceInfo } from '../types/diagnostic';

export async function detectCurrentEnvironment(): Promise<DeviceInfo> {
  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  let osVersion = '';
  let browser = 'Unknown Browser';
  let deviceName = 'Generic Smartphone Target';
  let manufacturer = 'Generic OEM';
  let model = 'Mobile Target';

  if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
    manufacturer = 'Apple';
    model = /iPad/.test(ua) ? 'iPad' : 'iPhone';
    deviceName = `${manufacturer} ${model}`;
    const match = ua.match(/OS ([\d_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/Android/.test(ua)) {
    os = 'Android';
    manufacturer = 'Android OEM';
    model = 'Mobile Target';
    deviceName = 'Android Smartphone';
    const match = ua.match(/Android ([\d.]+)/);
    if (match) osVersion = match[1];
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    os = 'macOS';
    manufacturer = 'Apple';
    model = 'Mac';
    deviceName = 'Apple Mac Test Workstation';
  } else if (/Windows/.test(ua)) {
    os = 'Windows';
    manufacturer = 'PC';
    model = 'x64 Terminal';
    deviceName = 'Windows Diagnostic Terminal';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
    manufacturer = 'Generic';
    model = 'Linux Target';
    deviceName = 'Linux Workstation Target';
  }

  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Google Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Apple Safari';
  } else if (ua.includes('Firefox')) {
    browser = 'Mozilla Firefox';
  } else if (ua.includes('Edg')) {
    browser = 'Microsoft Edge';
  }

  const cpuCores = navigator.hardwareConcurrency || 4;
  const deviceMemoryGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  
  let storageQuotaGb: number | undefined;
  let storageUsedGb: number | undefined;

  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota) storageQuotaGb = Math.round(estimate.quota / (1024 * 1024 * 1024));
      if (estimate.usage) storageUsedGb = Number((estimate.usage / (1024 * 1024 * 1024)).toFixed(2));
    }
  } catch (e) {
    console.warn('Storage estimate unavailable', e);
  }

  const connection = (navigator as unknown as { connection?: { effectiveType?: string; type?: string } }).connection;
  const connectionType = connection?.effectiveType || (navigator.onLine ? 'Connected (Broadband/Cellular)' : 'Offline');

  return {
    deviceName,
    manufacturer,
    model,
    os,
    osVersion: osVersion || 'Latest',
    browser,
    screenRes: `${window.screen.width} x ${window.screen.height}`,
    pixelRatio: window.devicePixelRatio || 1,
    cpuCores,
    deviceMemoryGb,
    storageQuotaGb,
    storageUsedGb,
    online: navigator.onLine,
    connectionType,
    language: navigator.language || 'en-US',
    touchSupport: navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    isSimulated: false,
  };
}
