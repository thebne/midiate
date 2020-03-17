import { SWITCH_APP, ADD_APP } from './actionTypes'

export const switchForegroundApp = appId => ({
  type: SWITCH_APP,
  payload: appId,
})

export const addApp = (appId, config) => ({
  type: ADD_APP,
  payload: {appId, config},
})
