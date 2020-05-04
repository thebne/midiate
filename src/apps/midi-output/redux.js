import { createStore } from "redux"

const defaultState = {
  outputs: [],
  transpose: 0,
}

function reducer(state=defaultState, action) {
  const outputs = [...state.outputs]
  switch (action.type) {
    case 'SELECT_OUTPUT':
      outputs.push(action.payload)
      return {
        ...state,
        outputs,
      }
      
    case 'DESELECT_OUTPUT':
      outputs.splice(action.payload)
      return {
        ...state,
        outputs,
      }
    case 'SET_TRANSPOSE':
      return {
        ...state,
        transpose: action.payload
      }

    default:
    return state
  }
}

export const selectOutput = id => 
  ({type: 'SELECT_OUTPUT', payload: id})
export const deselectOutput = id => 
  ({type: 'DESELECT_OUTPUT', payload: id})
export const setTranspose = t => 
  ({type: 'SET_TRANSPOSE', payload: t})

export default createStore(reducer)
