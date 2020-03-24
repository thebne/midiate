import React from 'react'
import { Midi } from "@tonaljs/tonal"
import { detect } from "@tonaljs/chord-detect"
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import './styles.css'

export default class ChordRecognizer extends React.Component {
  render() {
    let notes = this.props.currentlyPlayed
    const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
    const detection = detect(current)
    const notesList = current.map((s) => <li key={s}>{s}</li>)

    return (
      <Card>
        <CardContent>
          <div className='animationContainer2'>
            <h2 className='slide-up'>{detection}</h2>
          </div>   
      </CardContent>
    </Card>  
    )
  }

  // TODO move to config.json
}



export function config() {
  return {name: "Chord Recognizer"}
}

export let createSelectors = (selectors, state) => ({
   currentlyPlayed: selectors.getCurrentlyPlayed(state), 
   getLastEvent: selectors.getLastEvent(state)
  })
