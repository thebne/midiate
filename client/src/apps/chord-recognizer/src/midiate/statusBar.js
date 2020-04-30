import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { arePropsEqual } from '../utils.js'

const useStyles = makeStyles(theme => ({
  statusBar:  {
    fontFamily: "'Baloo Tamma 2', cursive",
  },
}))

export default React.memo(({chords}) => {
  const classes = useStyles()
  const detection = chords.detection.length ? chords.detection[0] : <i style={{color: '#ccc'}}>chord</i>
  return <span className={classes.statusBar}>{detection}</span>
}, arePropsEqual)
