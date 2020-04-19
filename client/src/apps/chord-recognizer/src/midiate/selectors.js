export default (selectors, state) => ({
   getLastEvent: selectors.getLastEvent(state),
   chords: selectors.getChords(state),
  })
