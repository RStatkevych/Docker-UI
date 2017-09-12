import React, { Component } from 'react'
import { Link } from 'react-router'
import * as alertsActions from '../../commons/alertsActions'

export default class Alerts extends Component {
	componentWillMount() {
		this.interval = setInterval(() => {
			this.props.dispatch(alertsActions.popAlert())
		}, 10000)
	}
	render() {
		const { alerts } = this.props
		return (
			<div className="alerts">
				{_.map(alerts, (alert) => {
					return (
						<div className={"alert "+ alert.type}>
							{alert.text}
						</div>
					)
				})}
			</div>
		)
	}
}