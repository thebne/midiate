import React from 'react'
import { connect } from 'react-redux'
import { switchForegroundApp } from '../redux/actions'
import { getRunningApps } from '../redux/selectors'

import Button from '@material-ui/core/Button'


class Default extends React.Component {
  handleSwitchForegroundApp = (pos) => {
    this.props.switchForegroundApp(pos)
  }

  render() {
    let apps = this.props.currentApps.map(app => 
      <Button key={app.appId} onClick={() => this.handleSwitchForegroundApp(app.appId)}>{app.config.name}</Button>)
    return <div>{apps}</div>
  }
}

export default connect(
  state => ({currentApps: getRunningApps(state)}),
  { switchForegroundApp }
)(Default)
