import React, { Fragment, useState, useLayoutEffect } from 'react'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import './style.module.css'
import { getIsActive, setIsActive } from './active'

export * from './mutator'
  
// midiate support
export default ({lastEvent}) => {
  const [stateActive, setStateActive] = useState(false)

  const toggle = () => {
    setIsActive(!getIsActive())
    setStateActive(getIsActive())
  }
  useLayoutEffect(() => {
    setStateActive(getIsActive())
  }, [lastEvent])

  return (
    <Fragment>
      <Typography variant="h3">Shortcuts</Typography>
      <Button onClick={() => toggle()} color={stateActive ? 'primary' : 'secondary'}>
      {stateActive ? "Disable" : "Activate"}
      </Button>
    </Fragment>
  )
}
export { default as config } from './midiate/config'
export { default as StatusBar } from './midiate/statusBar'
export { default as createSelectors } from './midiate/selectors'