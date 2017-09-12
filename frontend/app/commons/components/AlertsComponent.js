import React, { Component } from 'react'
import  { connect } from 'react-redux'

import * as alertsActions from '../alertsActions'

export class AlertsComponents extends Component {
	static mapDispatchToProps(dispatch) {
		let _dispatched = AlertsComponents._mapDispatchToProps(dispatch)
		return _.assign({
		  	dispatch,
		  	showSuccess: (text) => {
		  		return dispatch(alertsActions.showSuccess(text))
		  	},
			showWarning: (text) => {
		  		return dispatch(alertsActions.showWarn(text))
		  	},
		  	showError: (text) => {
		  		return dispatch(alertsActions.showError(text))
		  	}
		  	
		}, _dispatched)

	}

	static mapStateToProps(props) {
		let _props = AlertsComponents._mapStateToProps(props);
		return _props
	}

	static _mapDispatchToProps (dispatch) {
	}

	static _mapStateToProps(props) {
	}

}

export const connectRedux = (component) => {
	return connect(component.mapStateToProps,
				   component.mapDispatchToProps)(component)
}