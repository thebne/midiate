import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'

import { switchForegroundApp } from '../redux/actions'
import { getRunningApps } from '../redux/selectors'


function DefaultApp({currentApps, switchForegroundApp}) {
    return <Fragment>
        {currentApps.map(app => (
        <Button key={app.appId} onClick={() => switchForegroundApp(app.appId)}>
          {app.config.name}
        </Button>
        ))}
      </Fragment>
}

export default connect(
  state => ({currentApps: getRunningApps(state)}),
  { switchForegroundApp }
)(DefaultApp)
