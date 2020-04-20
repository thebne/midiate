export default (selectors, state) => ({ 
	lastEvent : selectors.getLastEvent(state),
	currentlyPlayed: selectors.getCurrentlyPlayed(state),
})
