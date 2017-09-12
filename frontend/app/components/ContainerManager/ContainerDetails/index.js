import React, { Component } from 'react'
import Provider from '../../../commons/provider'

import Details from './Details'

export default class DetailedContainerInfo extends Component {
	constructor() {
		super()
	}


	render() {
		const { routeParams: {container_id}} = this.props
		return (
			<div>
				<Details
					container_id={container_id}
				/>
			</div>
		)
	}
}

