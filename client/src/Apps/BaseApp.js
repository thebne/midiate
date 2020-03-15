import React from 'react'

class BaseApp extends React.Component {
  constructor(props) {
    super(props)
    window.addEventListener('server-midi', this.onEvent)

    this.state = {
      current: new Set()
    }
  }
  onEvent = (event) => {
    let {current} = this.state
    switch (event.detail.messageType) {
      case 'noteon':
        current.add(event.detail.note)
        break
      case 'noteoff':
        current.delete(event.detail.note)
        break
      default:
    }
    this.forceUpdate()
  }
}


export default BaseApp 
