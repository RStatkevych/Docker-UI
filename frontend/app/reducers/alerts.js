import * as constraints from '../constraints'


export default (state = {alerts: []}, action) => {
	const {alert} = action			
	switch(action.type) {
		case constraints.ALERT_WARN:
			state.alerts.unshift({type: 'warn', text: alert})
			return _.assign({}, state, {alerts: state.alerts});
		case constraints.ALERT_SUCCESS:
			state.alerts.unshift({type: 'ok', text: alert})
			return _.assign({}, state, {alerts: state.alerts});
		case constraints.ALERT_ERROR:
			state.alerts.unshift({type: 'err', text: alert})
			return _.assign({}, state, {alerts: state.alerts});
		case constraints.ALERT_POP:
			state.alerts.pop()
			return _.assign({}, state, {alerts: state.alerts});

		default:
			return state
	}
}