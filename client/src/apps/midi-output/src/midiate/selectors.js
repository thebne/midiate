export default (selectors, state) => ({
  lastEvent: selectors.getLastEvent(state),
  midiOutputs: selectors.getMidiOutputs(state),  
})
