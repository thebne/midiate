import React, { Fragment, useState, useEffect } from 'react'
import Piano from '../../../gadgets/piano/src/index'
import Typography from '@material-ui/core/Typography';
import { Scale, Range, Note } from "@tonaljs/tonal";
import styles from './style.module.css'
import { makeStyles } from '@material-ui/core/styles'
import { Container } from '@material-ui/core';
import StartingState from './starting'
import PlayingState from './playing'
import FailedState from './failure'
import States from './states'

// Util functions
const range = n => Array.from(Array(n).keys())

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const generateKeyColors = (scale) => {
  const notes = scale.notes
  let colors = {}
  for (const n of notes) {
    for (const i of range(10)) {
      colors[n.concat('', i.toString())] = {background: "green"}
    }
  }
  return colors
}

export default function ScaleChallenge({ notes })  {
  const classes = useStyles()
  const [gameState, setGameState] = useState(States.STARTING)
  const [scale, setScale] = useState('')
  
  let colors = {}
  if (scale) {
    colors = generateKeyColors(scale)
  }


  return (
    <Container>
      {gameState == States.STARTING && 
        <StartingState setScale={setScale} setGameState={setGameState} />}
      {gameState == States.PLAYING && 
        <PlayingState currentlyPlayedNotes={notes} setGameState={setGameState} scale={scale}/>}
      {gameState == States.END_FAILURE && <FailedState setGameState={setGameState} />}
    <Piano startNote="A0" endNote="C9" overrideClasses={styles} styles={colors} />
    </Container>
  )
}

// midiate support
export { default as config } from './midiate/config'
export { default as StatusBar } from './midiate/statusBar'
export { default as createSelectors } from './midiate/selectors'
