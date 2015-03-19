import requests
import json
import os
from flask import Flask, render_template

app = Flask(__name__)

SERVER_TOKEN = os.environ['uber_server_token']
BASE_URL = 'https://api.uber.com/v1'
DEST_LOC = (12.861452, 77.664708)


@app.route('/')
def index():
	return render_template('index.html')


@app.route('/eta/<lat>/<lng>')
def eta(lat,lng):
	url = BASE_URL + '/estimates/time'

	parameters = {
	    'server_token': SERVER_TOKEN,
	    'start_latitude': lat,
	    'start_longitude': lng
	}
	
	response = requests.get(url, params=parameters)
		
	return json.dumps(response.json(),sort_keys=True, indent=4)

@app.route('/price/<lat>/<lng>')
def price(lat,lng):
	url = BASE_URL + '/estimates/price'

	parameters = {
	    'server_token': SERVER_TOKEN,
	    'start_latitude': lat,
	    'start_longitude': lng,
	    'end_latitude': DEST_LOC[0],
	    'end_longitude': DEST_LOC[1]
	}
	
	response = requests.get(url, params=parameters)
		
	return json.dumps(response.json(),sort_keys=True, indent=4)


@app.route('/products/<lat>/<lng>')
def products(lat,lng):
	url = BASE_URL + '/products'

	parameters = {
	    'server_token': SERVER_TOKEN,
	    'latitude': lat,
	    'longitude': lng
	}
	
	response = requests.get(url, params=parameters)
		
	return json.dumps(response.json(),sort_keys=True, indent=4)


if __name__ == '__main__':
	app.run(debug=True)
