import React, { Component } from 'react'
import '../style.less'

export default class Button extends Component {
	render() {
		const { text, onClick, active } = this.props
		return active === true ? <button onClick={ onClick }>{ text }</button> : null 
	}
}