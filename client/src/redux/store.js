import { createStore } from "redux";
import rootReducer from "./reducers";
import { saveState, loadState } from "./localStorage";

const store = createStore(rootReducer,
  loadState(),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

store.subscribe(() => {
  saveState({
    settings: store.getState().settings
  });
});

export default store
