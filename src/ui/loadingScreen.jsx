import React, { useCallback } from 'react'
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
import Logo from '../logo.svg?react'
import { useSessionStorage } from '../utils/react'
import { IO_APP_ID, DEFAULT_APP_ID } from '../constants'

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    color: '#fff',
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

  advancedFab: {
    position: 'absolute',
    bottom: '3vw',
    right: '3vw',
  },
  ignoreFab :{
    position: 'absolute',
    bottom: '3vw',
    left: '3vw',
    opacity:'70%'
  },

  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}))

function LoadingScreen({isAnyMidiInputActive, switchForegroundApp}) {
  const [skip, setSkip] = useSessionStorage('skipScreen', false)
  const classes = useStyles()
  const skipScreen = useCallback(() => setSkip(true), [setSkip])
  const skipToSettings = useCallback(() => {
    switchForegroundApp(IO_APP_ID)
    skipScreen()
  }, [switchForegroundApp, skipScreen])
  const skipToDefault = useCallback(() => {
    switchForegroundApp(DEFAULT_APP_ID)
    skipScreen()
  }, [switchForegroundApp, skipScreen])

  const showScreen = !isAnyMidiInputActive && !skip
  return (
      <Modal
        className={classes.modal}
        open={showScreen}
        onClose={skipScreen}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          className: classes.backdrop,
        }}
      >
				<Fade in={showScreen}>
          <Container className={classes.container}>
          <Fab variant="extended" className={classes.ignoreFab} 
              onClick={skipToDefault}>
              Ignore
            </Fab>
            <Fab variant="extended" className={classes.advancedFab} 
              onClick={skipToSettings}>
              <SettingsIcon className={classes.extendedIcon} />
              Configure
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
