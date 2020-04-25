import React from 'react'
import { connect } from 'react-redux'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import AppDefaultIcon from '@material-ui/icons/MusicVideo'
import { makeStyles } from '@material-ui/core/styles'

import { DEFAULT_APP_ID } from '../constants'
import { 
  switchForegroundApp,
} from '../redux/actions'
import { 
  getApps,
} from '../redux/selectors'

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  paper: {
    width: '15vw',
    minWidth: '150px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    margin: theme.spacing(1),
    transition: 'background ease-in .2s',
    '& > svg': {
      width: 'auto',
      height: 'auto',
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.background.paper,
      '& > svg': {
        fill: theme.palette.background.paper,
      }
    },
  },
}))

function AppButton({switchForegroundApp, appId, config}) {
  const classes = useStyles()

  if (config.showInMenu === false)
    return null

  return (
    <Paper className={classes.paper}
      onClick={() => switchForegroundApp(appId)}>
      {config.icon || <AppDefaultIcon />}
      <Typography variant="button">{config.name}</Typography>
    </Paper>
  )
}


function DefaultApp({apps, switchForegroundApp}) {
  const classes = useStyles()

  return (
    <Container maxWidth={null} className={classes.container}>
      {Object.values(apps).map(app => (
        <AppButton {...app} key={app.appId}
          switchForegroundApp={switchForegroundApp} />
      ))}
    </Container>
  )
}

export const config = {
  id: DEFAULT_APP_ID,
  showInMenu: false,
}

export default connect(
  state => ({
    apps: getApps(state),
  }),
  { switchForegroundApp }
)(DefaultApp)
