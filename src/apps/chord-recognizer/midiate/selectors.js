export default (selectors, state) => ({
  notes: selectors.makeGetNotes({
    mode: 'smart',
    data: 'extended',
  })(state),
})
