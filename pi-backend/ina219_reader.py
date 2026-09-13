import board
import busio
from adafruit_ina219 import INA219

_i2c = None
_ina219 = None


def _get_sensor():
    global _i2c, _ina219

    if _ina219 is None:
        _i2c = busio.I2C(board.SCL, board.SDA)
        _ina219 = INA219(_i2c)

    return _ina219


def read_power_metrics():
    sensor = _get_sensor()

    bus_voltage_v = float(sensor.bus_voltage)
    shunt_voltage_mv = float(sensor.shunt_voltage)
    current_ma = float(sensor.current)
    power_mw = float(sensor.power)

    return {
        'bus_voltage_v': round(bus_voltage_v, 3),
        'shunt_voltage_mv': round(shunt_voltage_mv, 3),
        'current_ma': round(current_ma, 2),
        'current_a': round(current_ma / 1000.0, 3),
        'power_mw': round(power_mw, 2),
        'power_w': round(power_mw / 1000.0, 3),
    }
