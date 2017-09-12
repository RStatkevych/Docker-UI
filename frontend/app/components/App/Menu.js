import React, { Component } from 'react'
import { Link } from 'react-router'

export default class Menu extends Component {
	render() {
		return (
			<div className="menu-items">
				<Link to="/containers" activeClassName="active"><span className="fa fa-spinner menu-item"></span></Link>
				<Link to="/images" activeClassName="active"><span className="fa fa-spinner menu-item"></span></Link>
			</div>
		)
	}
}