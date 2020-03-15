import ServerHandler from './ServerHandler'

class Manager {
  constructor() {
    // TODO change to window.location.host || envVar if exists (compile time)
    this.serverHandler = new ServerHandler('127.0.0.1:5000')
    window.addEventListener('server-midi', this.onServerMidiEvent)
  }

  onServerMidiEvent = async (event) => {
    console.log(event.detail.note)
  }
}

export default Manager
