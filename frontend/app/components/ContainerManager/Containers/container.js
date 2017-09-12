import React, { Component } from 'react'
import ContainerList from './ContainerList'
import Provider from '../../../commons/provider'
import * as alertsActions from '../../../commons/alertsActions'


export default class ContainersIndex extends Component {
	constructor() {
		super()
		this.state = {
			containers: [],
			errorMessage: null,
			fetch: false
		}
		this.provider = new Provider('/containers');
	}

	fetchRecentContainers() {
		this.setState({fetch: false})
		this.provider
			.builder()
			.auth()
			.read()
				.then(
					(data) => {
						this.setState({containers: data.Response, fetch: true})
					},
					(data) => {
						this.setState({errorMessage: data.Error.message, fetch: true})
					}
				)
	}

	componentWillMount() {
		this.fetchRecentContainers();
	}

	render() {
		const { containers, fetch, errorMessage } = this.state;
		const { children } = this.props;
		return (
			<ContainerList 
				containers={containers}
				children={children}
				fetch={fetch}
				errorMessage={errorMessage}
				fetchNewContainersList={this.fetchRecentContainers.bind(this)}
				{...this.props}
				/>
		)
	}
}

