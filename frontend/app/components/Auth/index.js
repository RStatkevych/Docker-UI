import React, { Component } from 'react'
import Provider from '../../commons/provider'

export default class Auth extends Component {
	constructor() {
		super()
		this.state = {
			password: '',
			login: ''
		}
		this.provider = new Provider('/login')
	}

	signIn() {
		this.provider.builder()
			.basicAuth(this.state.login, this.state.password)
			.read()
			.then(
				(data, headers) => {
					window.localStorage.setItem('_auth', headers.get('Authorization'))
				}
			);
	}
	render() {
		return (
			<div className="login-form">
				<div>
					<label>
						Login:
						<input type='text' 
							value={this.state.login} 
							onChange={(event) => {this.setState({login: event.target.value})}}
							/>
					</label>
				</div>
				<div>
					<label>
						Password:
						<input type='text' 
							value={this.state.password}
							onChange={(event) => {this.setState({password: event.target.value})}}
							/>
					</label>
				</div>
				<div>
					<button onClick={this.signIn.bind(this)}>Log In</button>
				</div>
			</div>
		)
	}
}