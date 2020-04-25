import React, { useState } from 'react'
import { connect } from 'react-redux'
import Modal from '@material-ui/core/Modal'
import Fade from '@material-ui/core/Fade'
import Backdrop from '@material-ui/core/Backdrop'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Fab from '@material-ui/core/Fab'
import SettingsIcon from '@material-ui/icons/Settings'
import { makeStyles } from '@material-ui/core/styles'
import { 
  getIsAnyMidiInputActive,
} from '../redux/selectors'
import { switchForegroundApp } from '../redux/actions'
import { ReactComponent as Logo } from '../logo.svg'
import { useSessionStorage } from '../utils/react'
import { SETTINGS_APP_ID } from '../constants'

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    color: theme.palette.background.paper,
  },
  backdrop: {
    backgroundColor: theme.palette.primary.dark,
  },
  container: {
    outline: 'none',
    padding: theme.spacing(2, 4, 3),
    textAlign: 'center',
  },
  logo: {
    width: '35vw',
    maxWidth: '512px',
  },

  fab: {
    position: 'absolute',
    bottom: '3vw',
    right: '3vw',
  },

  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}))

function LoadingScreen({isAnyMidiInputActive, switchForegroundApp}) {
  const [skip, setSkip] = useSessionStorage('skipScreen', false)
  const classes = useStyles()

  const showScreen = !isAnyMidiInputActive && !skip
  return (
      <Modal
        className={classes.modal}
        open={showScreen}
        onClose={() => setSkip(true)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          className: classes.backdrop,
        }}
      >
				<Fade in={showScreen}>
          <Container className={classes.container}>
            <Fab variant="extended" className={classes.fab} 
              onClick={() => {
                switchForegroundApp(SETTINGS_APP_ID)
                setSkip(true)
              }}>
              <SettingsIcon className={classes.extendedIcon} />
              Advanced
            </Fab>
            <Logo className={classes.logo} />
            <Typography variant="h2">Connect a MIDI device to get started!</Typography>
            </Container>
          </Fade>
  </Modal>
  )
}

export default connect(
  (state, ownProps) => ({
    isAnyMidiInputActive: getIsAnyMidiInputActive(state),
  }),
  {switchForegroundApp},
)(LoadingScreen)
