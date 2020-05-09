import { combineReducers } from "redux";
import ui from "./ui";
import events from "./events";
import settings from "./settings";

export default combineReducers({ ui, events, settings });

