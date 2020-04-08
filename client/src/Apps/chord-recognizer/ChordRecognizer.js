import React, { useEffect, useState, Fragment } from 'react'
import { Animate } from 'react-move'
import { interpolate, interpolateTransformSvg } from 'd3-interpolate'
import { easeSinOut } from 'd3-ease'
import styles from './Style.module.css'

let ColorHash = require('color-hash')

const colorHash = new ColorHash({lightness: .5})

export default function ChordRecognizer({currentChords}) {
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
        width: '100%',
        height: '60vh',
        display: 'block',
        margin: 'auto'
        }} >
      <g transform="translate(50, 100)">
      {animations.map((animation) => <Animate
        key={animation.time}
        show={animation.active}
        start={{
          circle: {
          },
          g: {
            transform: 'translate(0, 60)',
            opacity: 0,
          },
        }}
        enter={{
          circle: {
          },
          g: {
            transform: 'translate(0,-25)',
            opacity: [1],
          },
          timing: { duration: 200, ease: easeSinOut },
        }}
        leave={{
          circle: {
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
          timing: { duration: 80, ease: easeSinOut },
        }}
        interpolation={(begValue, endValue, attr) => {
          if (attr === 'transform') {
            return interpolateTransformSvg(begValue, endValue)
          }
          return interpolate(begValue, endValue)
        }}
      >
        {({circle, g}) => {
          const [main, ...rest] = animation.detection
          return (
            <g {...g}
              className={styles.chordDetection}>
              <circle r="25" fill={colorHash.hex(main)} {...circle} />
              <text 
              fill="white" 
              fontSize="13"
              style = {{
                dominantBaseline: "middle",
                textAnchor: "middle",
              }} >
                {main}
              </text>
            {rest.map((secondary, i) => (
              <text 
                key={secondary}
                fill="white" 
                fontSize="8"
                y={5 * (i + 1)}
                style = {{
                  dominantBaseline: "hanging",
                  textAnchor: "middle",
                }} >
                  {secondary}
              </text>)
            )}
          </g>)
        }}
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
  return <span className={styles.statusBar}>{detection}</span>
}

export let createSelectors = (selectors, state) => ({
   getLastEvent: selectors.getLastEvent(state),
   currentChords: selectors.getCurrentChords(state),
  })
