import { createStore } from "redux";
import rootReducer from "./reducers";
import { saveState, loadState } from "./localStorage";

const store = createStore(rootReducer,
  loadState(),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

// Debounce localStorage writes to prevent UI jank during rapid MIDI input
let saveTimeout = null
store.subscribe(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    saveState({
      settings: store.getState().settings
    })
    saveTimeout = null
  }, 1000)
})

export default store
