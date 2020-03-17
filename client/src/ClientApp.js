import React from 'react'
import { connect } from 'react-redux'
import { addApp, switchForegroundApp } from './redux/actions'
import { getForegroundApp } from './redux/selectors'

import Default from './Apps/Default'
import ServerHandler from './ServerHandler'

// apps
import * as ChordRecognizer from './Apps/ChordRecognizer'
import * as LastNote from './Apps/LastNote'

class ClientApp extends React.Component {
  constructor(props) {
    super(props)
    // TODO change to window.location.host || envVar if exists (compile time)
    this.serverHandler = new ServerHandler('127.0.0.1:5000')

    this.appCache = []
    this.defaultApp = <Default />
  }

  componentDidMount() {
    // load apps
    [ 
      ChordRecognizer,
      LastNote
    ].forEach(app => {
      let pos = this.appCache.length
      this.props.addApp(pos, app.config())
      this.appCache.push(React.createElement(app.default), {appId: pos})
    })
  }

  handleBackToDefaultApp = () => {
    this.props.switchForegroundApp(null)
  }

  render() {
    let app = this.defaultApp
    let appId = this.props.foregroundApp
    if (appId != null)
      app = <div>
        <button onClick={() => this.handleBackToDefaultApp()}>Back</button>
        {this.appCache[appId]}
      </div>
    return app
  }
}

export default connect(
  (state, ownProps) => ({
    foregroundApp: getForegroundApp(state),
  }),
  { 
    addApp, 
    switchForegroundApp,
  }
)(ClientApp)
