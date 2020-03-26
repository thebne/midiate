import React, { useEffect, useState } from 'react'
import { Midi } from "@tonaljs/tonal"
import { detect } from "@tonaljs/chord-detect"
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import './styles.css'


const EPSILON_MS = 300

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
      <AnimationList detection={detection[0]} />
    )
  }
}

function AnimationList({detection}) {
  const [animations, setAnimations] = useState([])

  // triggered after every render if detection has changed
  // if new detection, add a new animation to list
  useEffect(() => {
    let newAnimations = [...animations]
    const now = new Date().getTime()

    let handled = false
    if (newAnimations.length) {
      let prevAnimation = newAnimations[newAnimations.length - 1]
      const deltaTime = now - prevAnimation.time
      if (detection && deltaTime < EPSILON_MS) {
        prevAnimation.active = true
        prevAnimation.time = now
        prevAnimation.chord = detection

        handled = true
      } else {
        prevAnimation.active = false
      }
    }
    if (detection && !handled) {
      newAnimations.push({time: now, chord: detection, active: true})
      handled = true
    }
    setAnimations(newAnimations)
  }, [detection]) // detection AND lastDetecton are different

  // for every animation in the list, create the animation element
  return <div className='animationContainer2'>
    {animations.map(a =>
        <ChordAnimation key={a.time} {...a} />
      )}
  </div>
}

function ChordAnimation({chord, active}) {
  return (
    <h2 className={['slide-up', 'text', active ? 'active' : ''].join(' ')}>{chord}</h2> //class name based on active; active becomes true when 
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
