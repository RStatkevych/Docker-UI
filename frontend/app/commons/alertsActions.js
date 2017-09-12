import * as constraints from '../constraints'

export const showSuccess = (text) => {
	return {
		type: constraints.ALERT_SUCCESS,
		alert: text
	}
}

export const showWarning = (text) => {
	return {
		type: constraints.ALERT_WARN,
		alert: text
	}
}


export const showError = (text) => {
	return {
		type: constraints.ALERT_ERROR,
		alert: text
	}
}

export const popAlert = () => {
	return {
		type: constraints.ALERT_POP
	}
}