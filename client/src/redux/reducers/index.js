import { combineReducers } from "redux";
import ui from "./ui";
import events from "./events";

export default combineReducers({ ui, events });

