export default (selectors, state) => ({ 
	lastEvent : selectors.getLastEvent(state),
})
