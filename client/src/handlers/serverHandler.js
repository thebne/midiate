import store from '../redux/store'
import { handleMidiEvent } from "../redux/actions"

class ServerHandler {
  constructor(host) {
    this.socket = new WebSocket(`ws://${host}/ws/input`)

    this.socket.onmessage = async (event) => {
      const buffer = await event.data.arrayBuffer()

      const view = new DataView(buffer)
      const deltaTime = view.getFloat64(0)
      const msg = new Uint8Array(buffer, 8)
      store.dispatch(handleMidiEvent(deltaTime, msg))
    }
  }
}
export default ServerHandler
