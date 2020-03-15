import React from 'react'

import ServerHandler from './ServerHandler'
import EventHandler from './EventHandler'

import ChordRecognizer from './Apps/ChordRecognizer'

class Client extends React.Component {
  constructor(props) {
    super(props)
    // TODO change to window.location.host || envVar if exists (compile time)
    this.serverHandler = new ServerHandler('127.0.0.1:5000')
    this.eventHandler = new EventHandler()

    this.apps = []
    this.apps.push(React.createElement(ChordRecognizer))

    this.state = {
      foregroundApp: this.apps[0],
    }
  }
  render() {
    return this.state.foregroundApp
  }
}

export default Client 
