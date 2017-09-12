export default (state = {width: 0, height: 0}, action) => {
	switch(action.type) {
		case 'WINDOW_RESIZE':
			const {width, height} = action			
			return _.assign({}, state, {width, height})
		default:
			return state
	}
}