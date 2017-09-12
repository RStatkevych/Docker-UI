import React, { Component } from 'react'
import Menu from './Menu'
import Alerts from './Alerts'

import './style.less'
export default class AppIndex extends Component {

	onWindowResize(height, width) {
		const {dispatch} = this.props;
		dispatch({type: 'WINDOW_RESIZE', height, width})
	}

	componentWillMount() {
		window.addEventListener('resize', () => {
			this.onWindowResize(window.innerHeight, window.innerWidth)
		})
	}
	render() {
		const { children, alerts } = this.props;
		return (
			<div className='app-body'>
				<Menu />
				<section className='main-body collumn'>
					{children}
				</section>
				<Alerts alerts={alerts.alerts} 
						dispatch={this.props.dispatch} />
			</div>
		)
	}
}