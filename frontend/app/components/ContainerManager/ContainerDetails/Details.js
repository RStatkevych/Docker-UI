import React, { Component } from 'react'
import { Link } from 'react-router'
import Provider from '../../../commons/provider'
import BarChart from '../../../commons/components/BarChart'



export default class Details extends Component {
	constructor() {
		super()
		this.state = {
			log: '',
			command: '',
			stats: []
		}
	}

	fetchStdout() {
		this.provider
			.builder()
			.auth()
			.body({command: this.state.command})
			.stream(true)
			.create()
			.then(data => {
				this.setState({log: this.state.log + data});
			})
	}


	restartContainer() {
		this.restartProvider
			.builder()
			.auth()
			.body({action: 'restart'})
			.change()
			.then(data => {
			})
	}

	stopContainer() {
		this.restartProvider
			.builder()
			.auth()
			.body({action: 'stop'})
			.change()
			.then(data => {
			})
	}

	killContainer() {
		this.restartProvider
			.builder()
			.auth()
			.body({action: 'kill'})
			.change()
			.then(data => {
			})
	}

	removeContainer() {
		this.restartProvider
			.builder()
			.auth()
			.body({action: 'rm'})
			.change()
			.then(data => {
			})
	}
	fetchCPUStats() {
		this.interval = setInterval(()=> {
			this.statsProvider
				.builder()
				.auth()
				.read()
				.then(data => {
					this.setState({
						stats: data.Response.cpu
					})
				})
			}, 2000)
	}

	componentDidMount() {
		const { container_id } = this.props

		this.provider = new Provider(`/containers/${container_id}/command`);
		this.restartProvider = new Provider(`/containers/${container_id}`);
		this.statsProvider = new Provider(`/containers/${container_id}/stats`)

		this.fetchCPUStats()
	}

	componentWillUnmount() {
		clearInterval(this.interval)
	}

	render() {
		const {container_id} = this.props;
		const {log, stats} = this.state
		return (
			<div>
				<div>
					<h1>Name</h1>
					<div>
						<button onClick={this.stopContainer.bind(this)}>Stop</button>
						<button onClick={this.restartContainer.bind(this)}>Restart</button>
						<button onClick={this.removeContainer.bind(this)}>Remove</button>
						<button onClick={this.killContainer.bind(this)}>Kill</button>
					</div>
				</div>
				<Link to={"/containers/" +container_id + "/fs"}><h1>Files</h1></Link>
				<div>
					<textarea 
						onChange={(event) => {this.setState({command: event.target.value})}}
						value={this.state.command}></textarea>
				</div>
				<button onClick={this.fetchStdout.bind(this)}>Execute Command</button>
				<div>
					{log}
				</div>
				<div>
					<BarChart data={stats} maxValue={100}/>
				</div>
			</div>
		)
	}
}

