class ServerHandler {
  constructor(host) {
    this.socket = new WebSocket(`ws://${host}/ws/input`)

    this.socket.onmessage = async (event) => {
      const buffer = await event.data.arrayBuffer()
      window.dispatchEvent(new CustomEvent('server-midi-raw', {detail: buffer}))
    }
  }
}
export default ServerHandler
