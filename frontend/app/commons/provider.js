import * as _ from 'lodash'
import * as alertsActions from './alertsActions'
import * as index from '../'

const apiUrl = 'http://localhost/api'

class DockerRequest {
	constructor(url, headers = {}) {
		this.url = url;``
		this._headers = headers
		this._query = {}
		this._stream = false
		this._partialStream = false

		this._data = {}
		this._dataCaster = JSON.parse
	}

	headers(key, value) {
		this._headers[key] = value
		return this
	}

	castTo(caster) {
		this._dataCaster = caster
		return this
	}

	body(data) {
		this._body = data
		return this
	}

	query(key, value) {
		this._query[key] = value;
		return this; 
	}
	stream(value) {
		this._stream = value
		return this 
	}
	auth() {
		let token = window.localStorage.getItem('_auth')
		this._headers['Authorization'] = token
		return this
	}
	streamPartial(value) {
		this._partialStream = value
		return this 
	}
	basicAuth(username, password) {
		this._headers['Authorization'] = 'Basic ' + btoa(username + ":" + password)
		return this 
	}
	create() {
		let _headers = new Headers(this._headers)
		_headers.append('Content-Type', 'application/json');

		let qstring = _.map(this._query, (value, key) => `${key}=${value}`).join('&');

		let request = new Request(this.url + (qstring.length > 0 ? '?' + qstring : ''), {
			method: 'POST',
			headers: _headers,
			cache: 'no-cache',
			body: JSON.stringify(this._body)
		})

		return this._performRequest(request)
	}

	read() {
		let _headers = new Headers(this._headers)
		let qstring = _.map(this._query, (value, key) => {
			return `${key}=${value}`
		}).join('&')
		
		let request = new Request(this.url + (qstring.length > 0 ? '?' + qstring : ''), {
			method: 'GET',
			headers: _headers,
			cache: 'no-cache'
		})

		return this._performRequest(request)
	}

	change() {
		let _headers = new Headers(this._headers)
		_headers.append('Content-Type', 'application/json');

		let qstring = _.map(this._query, (value, key) => `${key}=${value}`).join('&');

		let request = new Request(this.url + (qstring.length > 0 ? '?' + qstring : ''), {
			method: 'PUT',
			headers: _headers,
			cache: 'no-cache',
			body: JSON.stringify(this._body)
		})

		return this._performRequest(request)
	}

	remove() {

	}

	_performRequest (request) {
		let promise = new PromiseWrapper((resolve, reject) => {
			fetch(request)
				.then((response) => {
					if (!this._stream) {
						if(response.status < 400) {	
							response.text().then(
								(text) => {
									resolve([this._dataCaster(text), response.headers, response])
								},
							)
						} else {
							response.text().then(
								(text) => {
									reject([this._dataCaster(text), response.headers, response])
								} 
							)
						}
					} else {
						response.blob().then((blob) => {
							let reader = new FileReader();
/*							if(!this._partialStream) {	
								reader.addEventListener("loadend", function() {
									resolve(reader.result)
								});
							} else {*/
								reader.addEventListener("progress", function() {
									resolve(reader.result)

								});								
							//}
							if(!this._partialStream) {	
								reader.addEventListener("loadend", function() {
									reader.close()
								})
							}
							reader.readAsText(blob);
						})
					}
				})
				.catch((e) => {
					reject(e)
				})
		})
		return promise;
	}

}

class PromiseWrapper {
	constructor(func) {
		this.promise = new Promise(func);
	}
	then(func) {
		this.promise.then(
			(data) => {
				let [body, headers, response] = data;
				func(body, headers);
			}
		)
		return this;
	}
	catch(func) {
		this.promise.catch(
			(data) => {
				let [body, headers, response] = data;
				func(body, headers);
			}
		)
		return this;
	}
}

export default class Provider {
	constructor(url) {
		this.setUrl(url)
	}


	setUrl(url) {
		this.url = apiUrl + url
	}

	builder() {
		return new DockerRequest(this.url)
	}
}