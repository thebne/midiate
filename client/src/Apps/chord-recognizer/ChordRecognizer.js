import React, { useEffect, useState, Fragment } from 'react'
import { Animate } from 'react-move'
import { interpolate, interpolateTransformSvg } from 'd3-interpolate'
import { easeSinOut } from 'd3-ease'


export default function ChordRecognizer({currentlyPlayed, currentChords}) {
  const [animations, setAnimations] = useState([])

  // add or remove animation objects
  useEffect(() => {
    let newAnimations = [...animations]
    const now = new Date().getTime()
    
    // check if there's an existing detection. if so, remove it
    if (newAnimations.some(a => a.active)) {
      let prevAnimation = newAnimations[newAnimations.length - 1]
      prevAnimation.active = false
      setTimeout(() => setAnimations((animations) => {
        animations.splice(animations.indexOf(prevAnimation), 1)
        return animations
      }), 4000)
    }

    // add a new detection
    if (currentChords.detection) {
      newAnimations.push({...currentChords, time: now, active: true})
    }
    setAnimations(newAnimations)
  }, [currentChords.id])

  // rename existing detections
  useEffect(() => {
    let newAnimations = [...animations]
    let prevAnimation = newAnimations[newAnimations.length - 1]
    if (prevAnimation 
        && prevAnimation.id === currentChords.id) {
      prevAnimation.detection = currentChords.detection
      setAnimations(newAnimations)
    }
  }, [currentChords.detection])

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
                {animation.detection[0]}
              </text>
            </g>)}
    </Animate>)}
  </g></svg>
  )
}
  
// TODO move to config.json
export function config() {
  return {name: "Chord Recognizer"}
}

export function StatusBar({currentChords}) {
  const detection = currentChords.detection ? currentChords.detection[0] : <i style={{color: '#ccc'}}>chord</i>
  return <Fragment>{detection}</Fragment>
}

export let createSelectors = (selectors, state) => ({
   currentlyPlayed: selectors.getCurrentlyPlayed(state), 
   getLastEvent: selectors.getLastEvent(state),
   currentChords: selectors.getCurrentChords(state),
  })
