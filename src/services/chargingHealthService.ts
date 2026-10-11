import type { PowerMetrics, ChargingHealthResult } from '../types/diagnostic';

export function analyzeChargingHealth(metrics: PowerMetrics): ChargingHealthResult {
  const voltage = metrics.bus_voltage_v;
  const current = metrics.current_a;
  const power = metrics.power_w;

  // AuthentiX prototype baseline for a 5V / 2.1A USB-A charging source.
  const voltageGood = voltage >= 4.5 && voltage <= 5.25;
  const currentPresent = current >= 0.1;
  const powerPresent = power >= 0.5;

  if (!voltageGood) {
    return {
      status: 'problem',
      label: 'CHARGING: PROBLEM',
      message:
        'Charging voltage is outside the expected 5V USB range. Check the power source, cable, connector, or charging path.',
      voltage,
      current,
      power,
    };
  }

  if (current < 0.05 && power < 0.25) {
    return {
      status: 'problem',
      label: 'CHARGING: PROBLEM',
      message:
        'Very little charging current was detected. The device may not be charging correctly; inspect the cable, connector, charging port, and power source.',
      voltage,
      current,
      power,
    };
  }

  if (!currentPresent || !powerPresent) {
    return {
      status: 'check',
      label: 'CHARGING: CHECK',
      message:
        'Charging is present, but current or power is low. This can also happen when the battery is nearly full, the phone is warm, or the device is limiting charge current.',
      voltage,
      current,
      power,
    };
  }

  return {
    status: 'good',
    label: 'CHARGING: GOOD',
    message:
      'Charging voltage, current, and power are within the expected range for the connected 5V test setup.',
    voltage,
    current,
    power,
  };
}
