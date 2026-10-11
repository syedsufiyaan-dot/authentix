from flask import Flask, jsonify
from flask_cors import CORS

from ina219_reader import read_power_metrics
from adb_reader import read_device_info

app = Flask(__name__)
CORS(app)


@app.get('/health')
def health():
    return jsonify({
        'service': 'AuthentiX Pi Backend',
        'status': 'ok'
    })


@app.get('/api/device')
def device_info():
    try:
        info = read_device_info()
        return jsonify({
            'success': True,
            'data': info
        })
    except Exception as exc:
        return jsonify({
            'success': False,
            'error': str(exc)
        }), 500


@app.get('/api/power')
def power_metrics():
    try:
        metrics = read_power_metrics()
        return jsonify({
            'success': True,
            'data': metrics
        })
    except Exception as exc:
        return jsonify({
            'success': False,
            'error': str(exc)
        }), 500


@app.get('/api/diagnostic/live')
def live_diagnostic():
    result = {
        'device': None,
        'power': None,
    }

    try:
        result['device'] = read_device_info()
    except Exception as exc:
        result['device'] = {
            'connected': False,
            'error': str(exc),
        }

    try:
        result['power'] = read_power_metrics()
    except Exception as exc:
        result['power'] = {
            'available': False,
            'error': str(exc),
        }

    return jsonify({
        'success': True,
        'data': result,
    })


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
    )
