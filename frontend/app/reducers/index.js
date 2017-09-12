
import { combineReducers } from 'redux'
import windowSize from './windowSize'
import alerts from './alerts'


export default combineReducers({
	windowSize,
	alerts
});
