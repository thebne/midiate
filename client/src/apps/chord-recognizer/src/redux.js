import { createStore } from "redux"
import { connect } from 'react-redux'

const defaultState = {
  chordDetectionRange: [null, null],
  relativeScale: false,
  detections: {},
}

function reducer(state=defaultState, action) {
  switch (action.type) {
    case 'SET_CHORD_DETECTION_RANGE':
      return {
        ...state,
        chordDetectionRange: [action.payload.start, action.payload.end],
      }
      
    case 'SET_RELATIVE_SCALE':
      return {
        ...state,
        relativeScale: action.payload
      }
    case 'ADD_DETECTION':
      return {
        ...state,
        detections: {
          ...state.detections,
          [action.payload.id]: {...action.payload},
        },
      }

    case 'REMOVE_DETECTION':
      const detections = [...state.detections]
      delete detections[action.payload]
      return {
        ...state,
        detections,
      }

    case 'CLEAR_DETECTIONS':
      return {
        ...state,
        detections: {},
      }

    case 'UPDATE_DETECTION':
      return {
        ...state,
        detections: {
          ...state.detections,
          [action.payload.id]: {
            ...state.detections[action.payload.id],
            detection: [...action.payload.detection],
          },
        },
      }

    default:
    return state
  }
}

export const setChordDetectionRange = (start, end) => 
  ({type: 'SET_CHORD_DETECTION_RANGE', payload: {start, end}})
export const setRelativeScale = relativeScale => 
  ({type: 'SET_RELATIVE_SCALE', payload: relativeScale})
export const addDetection = chord => 
  ({type: 'ADD_DETECTION', payload: chord})
export const removeDetection = id => 
  ({type: 'REMOVE_DETECTION', payload: id})
export const clearDetections = id => 
  ({type: 'CLEAR_DETECTIONS'})
export const updateDetection = (id, detection) => 
  ({type: 'UPDATE_DETECTION', payload: {id, detection}})

export const connectApp = connect(
  store => ({
    chordDetectionRange: store.chordDetectionRange,
    relativeScale: store.relativeScale || false,
    detections: store.detections,
  }),
  {
    setChordDetectionRange, 
    setRelativeScale, 
    addDetection, 
    removeDetection,
    clearDetections,
    updateDetection,
  }
)

export default createStore(reducer)
