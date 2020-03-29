import React, { useEffect, useState, Fragment } from 'react'
import { Midi } from "@tonaljs/tonal"
import { detect } from "@tonaljs/chord-detect"
import { NodeGroup } from 'react-move'
import { interpolate, interpolateTransformSvg } from 'd3-interpolate'
import { easeSinOut } from 'd3-ease'
import './styles.css'


function detectChord(notes) {
  const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
  return detect(current)
}

export default function ChordRecognizer({currentlyPlayed}) {
  const [animations, setAnimations] = useState([])

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
    if (newAnimations.length) {
      let prevAnimation = newAnimations[newAnimations.length - 1]
      // handle alteration of current animation
      if (chord) {
        prevAnimation.chord = chord
        handled = true
      } else if (currentlyPlayed.length == 0) {
        // remove animation from list (will still animate the exit)
        newAnimations.splice(newAnimations.indexOf(prevAnimation), 1)
      }
    }

    // is there still a new detection to handle? 
    if (chord && !handled) {
      // this is a new detection
      newAnimations.push({time: now, chord})
      handled = true
    }
    setAnimations(newAnimations)
  }, [chord, currentlyPlayed])

  // for every animation in the list, create the animation element
	//<svg viewBox="0 0 1000 350" style={{position: 'absolute', width: '100%', height: '100%', left: '0px', top: '0px'}}>
  return <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{
      width: '100%',
      height: '100%',
    }}><g transform="translate(50, 50)">
    <NodeGroup
      data={animations}
      keyAccessor={a => a.time}
      start={() => ({
        circle: {
          fill: 'white',
        },
        g: {
  				transform: 'translate(0, 120)',
          opacity: 0,
        },
      })}
      enter={() => ({
        circle: {
          fill: ['red'],
        },
        g: {
          transform: 'translate(0,-25)',
          opacity: [1],
        },
        timing: { duration: 100, ease: easeSinOut },
      })}
      leave={() => [{
        circle: {
          fill: ['blue'],
        },
        g: {
          opacity: [.1],
          transform: ['translate(0, -75)'],
        },
        timing: { duration: 4000, ease: easeSinOut },
      }, {
      }]}
			update={() => ({
        g: {
          opacity: 1,
          transform: 'translate(0,-25)',
        },
        timing: { duration: 50, ease: easeSinOut },
			})}
			interpolation={(begValue, endValue, attr) => {
				if (attr === 'transform') {
					return interpolateTransformSvg(begValue, endValue)
				}

				return interpolate(begValue, endValue)
			}}
    >
      {(nodes) => <Fragment>{nodes.map(({key, data: {chord}, state: {circle, g}}) => (
        <g key={key} {...g}>
				  <circle stroke="grey" r="5" {...circle} />
				  <text fill="black" fontSize="3">{chord}</text>
  			</g>))}
    </Fragment>}
  </NodeGroup>
  </g></svg>
}
  
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
