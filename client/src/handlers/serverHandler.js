import store from '../redux/store'
import { handleMidiEvent } from "../redux/actions"

class ServerHandler {
  constructor(host) {
    this.socket = new WebSocket(`ws://${host}/ws/input`)

    this.socket.onmessage = async (event) => {
      const buffer = await event.data.arrayBuffer()
      store.dispatch(handleMidiEvent(buffer))
    }
  }
}
export default ServerHandler
