import React, {Component} from 'react'
import Provider from '../../../commons/provider'
import {Link} from 'react-router'


export default class ShortContainerInfo extends Component {
	constructor() {
		super();

		this.state = {
			containerInfo: {},
			fetched: true
		}
	}

	fetchSingleContainer() {
		this.setState({fetched: false})
		this.provider
			.builder()
			.auth()
			.read()
			.then((data) => {
				this.setState({containerInfo: data.Response, fetched: true})
			})
	}

	componentWillReceiveProps(props) {
		const {routeParams: {container_id}} = props

		if(container_id !== this.props.container_id) {
			this.provider.setUrl(`/containers/${container_id}`)
			this.fetchSingleContainer()
		}

	}
	componentWillMount() {
		const {routeParams: {container_id}} = this.props 
		this.provider = new Provider(`/containers/${container_id}`);
		this.fetchSingleContainer()
	}
	render() {
		const {containerInfo: {binds, cmd, created, image_hash, image_name, name, ports_binds, envs}, fetched} = this.state
		const {routeParams: {container_id}} = this.props

		return (
			fetched ? (
				<div className="short-container-data">
					<div>
						<div><h4>{name}</h4></div>
						<div><Link to={'/containers/' + container_id + '/details' }>Details</Link></div>

						<div>
							<span>Created:</span>
							<span>{created }</span>
						</div>
						<div>
							<span>Image:</span>
							<span><Link to={'/images/'+image_hash}>{image_name}</Link></span>
						</div>
						<div>
							<span>Image Hash:</span>
							<span>{image_hash}</span>
						</div>
					</div>

					<div>
						<div>
							<h4>Binds</h4>
						</div>
						<div>
							<span>Mounts:</span>
							<div>
							<table className="short-container-data-table">
								{
									_.map(binds, (bind) => {
										let [bindFrom, bindTo] = bind.split(':')
										return <tr><td>{bindFrom}</td><td>{bindTo}</td></tr>
									})
								}
							</table>
							</div>
						</div>
					</div>

					<div>
						<div>
							<h4>Execution</h4>
						</div>
						<div>
							<span>CMD:</span>
							<span>{cmd.join(' ')}</span>
						</div>
						<div>
							<span>Environment Variables:</span>
							<div>
							<table>
								{
									_.map(envs, (env_) => {
										let [name, value] = env_.split('=')
										return <tr><td>{name}</td><td>{value}</td></tr>
									})
								}
							</table>
							</div>
						</div>
					</div>
				</div>
			)
			: null
		)
	}
}