from flask import Flask, jsonify
from flask_cors import CORS

from ina219_reader import read_power_metrics

app = Flask(__name__)
CORS(app)


@app.get('/health')
def health():
    return jsonify({
        'service': 'AuthentiX Pi Backend',
        'status': 'ok'
    })


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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
