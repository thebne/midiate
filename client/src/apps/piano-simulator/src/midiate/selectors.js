export default (selectors, state) => ({ 
  lastEvent : selectors.getLastEvent(state),
  notes: selectors.makeGetNotes()(state),
})
