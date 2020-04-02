import React, { useEffect, useState, useRef, Fragment } from 'react'
import { Midi } from "@tonaljs/tonal"
import { detect } from "@tonaljs/chord-detect"
import { NodeGroup, Animate } from 'react-move'
import { interpolate, interpolateTransformSvg } from 'd3-interpolate'
import { easeSinOut } from 'd3-ease'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';


function detectChord(notes) {
  const current = notes.sort((  n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
  return detect(current)
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// is a subset of b
const isSubset = (a, b) => a.every(val => b.includes(val))

export default function ChordRecognizer({currentlyPlayed}) {
  const [animations, setAnimations] = useState([])
  const previousCurrentlyPlayed = usePrevious(currentlyPlayed)
  let notes = currentlyPlayed
  const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
  const detection = detectChord(current)
  const chord = detection[0]

  // triggered after every render if detection has changed
  // if new detection, add a new animation to list
  useEffect(() => {
    // create a copy of animations
    let newAnimations = [...animations]
    const now = new Date().getTime()

    // handled = did we take care of updating the state with the new detection?
    let handled = false

    // is there at least one animation presented on the screen?
    if (newAnimations.some(a => a.active)) {
      let prevAnimation = newAnimations[newAnimations.length - 1]
      // handle alteration of current animation
      if (chord) {
        // handle the case of leaving the chord notes in parts and it creates a new detection
        if (!isSubset(currentlyPlayed, previousCurrentlyPlayed)) {
          prevAnimation.chord = chord
        }
        handled = true
      // handle the case of leaving the chord notes in parts and it nullifies the detection
      } else if (currentlyPlayed.length == 0) {
        // set current animation to be inactive animate the exit)
        prevAnimation.active = false
        setTimeout(() => setAnimations((animations) => {
          animations.splice(animations.indexOf(prevAnimation), 1)
          return animations
        }), 4000)
      }
    }

    // is there still a new detection to handle? 
    if (chord && !handled) {
      // this is a new detection
      newAnimations.push({time: now, chord, active: true})
      handled = true
    }
    setAnimations(newAnimations)
  }, [chord, currentlyPlayed])

  return (
    <svg 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg" 
      style={{
        width: '400px',
        height: '700px',
        display: 'block',
        margin: 'auto'
        }} >
      <g transform="translate(50, 100)">
      {animations.map((animation) => <Animate
        key={animation.time}
        show={animation.active}
        start={{
          circle: {
            fill: '#2E86C1',
          },
          g: {
            transform: 'translate(0, 60)',
            opacity: 0,
          },
        }}
        enter={{
          circle: {
            fill: ['#2E86C1'],
          },
          g: {
            transform: 'translate(0,-25)',
            opacity: [1],
          },
          timing: { duration: 200, ease: easeSinOut },
        }}
        leave={{
          circle: {
            fill: ['#A9CCE3'],
          },
          g: {
            opacity: [.1],
            transform: ['translate(0, -200)'],
          },
          timing: { duration: 4000, ease: easeSinOut },
        }}
        update={{
          g: {
            opacity: 1,
            transform: 'translate(0,-25)',
          },
          timing: { duration: 50, ease: easeSinOut },
        }}
        interpolation={(begValue, endValue, attr) => {
          if (attr === 'transform') {
            return interpolateTransformSvg(begValue, endValue)
          }
          return interpolate(begValue, endValue)
        }}
      >
        {({circle, g}) => (
            <g {...g}>
              <circle style={{x:0, y:0}} r="25" {...circle} />
              <text 
              fill="white" 
              fontSize="15"
              style = {{
                x: "50%", 
                y: "50%", 
                dominantBaseline: "middle",
                textAnchor: "middle",
              }} >
                {animation.chord}
              </text>
            </g>)}
    </Animate>)}
  </g></svg>
  )
}
/*
(
      )
    */
  
// TODO move to config.json
export function config() {
  return {name: "Chord Recognizer"}
}

export function StatusBar({currentlyPlayed}) {
  const chord = detectChord(currentlyPlayed)
  const detection = chord.length ? chord[0] : <i style={{color: '#ccc'}}>chord</i>
  return <Fragment>{detection}</Fragment>
}

export let createSelectors = (selectors, state) => ({
   currentlyPlayed: selectors.getCurrentlyPlayed(state), 
   getLastEvent: selectors.getLastEvent(state)
  })
