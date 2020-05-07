import React, { useState, useLayoutEffect } from 'react'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import { useLastEvent } from '../../../api/events'

import './style.module.css'
import { getIsActive, setIsActive } from './active'

export * from './mutator'
  
export default () => {
  const [stateActive, setStateActive] = useState(false)
  const lastEvent = useLastEvent()

  const toggle = () => {
    setIsActive(!getIsActive())
    setStateActive(getIsActive())
  }
  useLayoutEffect(() => {
    setStateActive(getIsActive())
  }, [lastEvent])

  return (
    <Container maxWidth="xl">
      <Typography variant="h3">Shortcuts</Typography>
      <Button onClick={() => toggle()} color={stateActive ? 'primary' : 'secondary'}>
      {stateActive ? "Disable" : "Activate"}
      </Button>
    </Container>
  )
}
export const config = {
  id: "SHORTCUTS",
  showInMenu: false,
}

export { default as StatusBar } from './statusBar'
export { default as BackgroundTask } from './backgroundTask'

