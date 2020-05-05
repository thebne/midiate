import { createSelector } from 'reselect'
import { useSelector } from 'react-redux'
import { getEventsState } from './events'

const makeGetNotes = (config={}) => {
  const {mode="loose", data="simple"} = config
  const noteSelector = (() => {
    switch (mode) {
      case 'loose':
        return getLooseNotes
      case 'smart':
        return getSmartNotes
      default:
        throw new Error(`unknown mode ${mode}`)
    }})()

  return createSelector(
    [noteSelector],
    notes => {
      switch (data) {
        case 'simple':
          if (mode === 'smart') {
            return {
              ...notes,
              events: notes.events.map(e => e.note)
            }
          }
          return notes.map(e => e.note)
        case 'extended':
          return notes
        default:
          throw new Error(`unknown data type ${data}`)
      }
    }
  )
}

const getLooseNotes = createSelector(
  [getEventsState],
  events => events.notes || []
)

const getSmartNotes = createSelector(
  [getEventsState],
  events => events.smartNotes
)

export const useNotes = cfg => useSelector(makeGetNotes(cfg))
