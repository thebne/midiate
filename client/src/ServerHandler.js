import store from './redux/store'
import { HANDLE_MIDI_EVENT } from "./redux/actionTypes"

class ServerHandler {
  constructor(host) {
    this.socket = new WebSocket(`ws://${host}/ws/input`)

    this.socket.onmessage = async (event) => {
      const buffer = await event.data.arrayBuffer()
      store.dispatch({type: HANDLE_MIDI_EVENT, payload: buffer})
    }
  }
}
export default ServerHandler
