import React, { useEffect, useState } from 'react'
import { Midi } from "@tonaljs/tonal"
import { detect } from "@tonaljs/chord-detect"
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import './styles.css'

/* 
Logic:

detection  null, lastEvent null --> right before starting; show placeholders
detection, lastEvent null ---> first chord played

detection == lastEvent ON

last event note on: keep chord there; note off OR detection changed to something DIFF- fire animation 

*/

export default class ChordRecognizer extends React.Component {
  
  render() {
    const {lastEvent} = this.props
    let notes = this.props.currentlyPlayed
    const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
    const detection = detect(current)
    console.log('Detection ', detection)
    const notesList = current.map((s) => <li key={s}>{s}</li>)
  
    return (
      <ChordAnimator detection={detection[0]} />  
    )
  }
}

function ChordAnimator(props) {
  console.log(props)
  const [animations, setAnimations] = useState([])
  const {detection} = props

  // triggered after every render if detection has changed
  // if new detection, add a new animation to list
  useEffect(() => {
    let newAnimations = [...animations]
    const now = new Date().getTime()
    if (detection) {
      newAnimations.push({startTime: now})
      setAnimations(newAnimations)
    }
    console.log('new animations', newAnimations)
  }, [detection]) // detection AND lastEvent are different?

  // for every animation in the list, create the animation element
  return <div className='animationContainer2'>
    {animations.map(a =>
        <ChordAnimation detection={detection} key={a.startTime} {...a} />
      )}
  </div>
}

function ChordAnimation(props) {
  console.log('creating chord animation')
  return (
    <h2 className='slide-up text'>{props.detection}</h2>
  )
}
  
// TODO move to config.json
export function config() {
  return {name: "Chord Recognizer"}
}

export let createSelectors = (selectors, state) => ({
   currentlyPlayed: selectors.getCurrentlyPlayed(state), 
   getLastEvent: selectors.getLastEvent(state)
  })
