import React, { useEffect, useCallback, useMemo, useRef } from 'react'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import { Note } from "@tonaljs/tonal"
import { useLastEvent } from '../../api/events'
import { useSetting, useSessionValue } from '../../api/settings'
import Piano from '../../gadgets/piano'
import styles from './style.module.css'

export const usePressed = () =>
  useSessionValue('pressed', {})
export const useToggle = () =>
  useSetting('toggle', false)

export function BackgroundTask() {
  const lastEvent = useLastEvent()
  const [,setPressed] = usePressed()
  const pendingUpdates = useRef({})
  const rafId = useRef(null)

  useEffect(() => {
    // show animation only for note press
    if (!lastEvent || lastEvent.messageType !== 'noteon') {
      return
    }

    // Accumulate updates
    const n = lastEvent.note
    pendingUpdates.current[n] = (pendingUpdates.current[n] || 0) + 15

    // Batch updates using requestAnimationFrame
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        const updates = pendingUpdates.current
        pendingUpdates.current = {}
        rafId.current = null

        setPressed(pressed => {
          const newPressed = {...pressed}
          for (const [note, increment] of Object.entries(updates)) {
            newPressed[note] = (newPressed[note] || 0) + increment
          }
          return newPressed
        })
      })
    }
  }, [lastEvent, setPressed])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  return null
}

export default function Heatmap() {
  const [pressed, setPressed] = usePressed()
  const [toggle, setToggle] = useToggle()

  const switchType = useCallback(() => setToggle(t => !t), [setToggle])
  const clear = useCallback(() => setPressed({}), [setPressed])

  // Memoize style calculations to avoid recalculating on every render
  const { heights, colors } = useMemo(() => {
    const heights = {}
    const colors = {}
    const values = Object.values(pressed)
    const max = values.length > 0 ? Math.max(...values) : 0

    for (const [note, x] of Object.entries(pressed)) {
      // set color styling per key type (black/white)
      if (Note.accidentals(Note.simplify(note)).length) {
        colors[note] = {background: colorBlackKeys(x, 0, max), border: colorBlackKeys(x, 0, max)}
      } else {
        colors[note] = {background: colorWhiteKeys(x, 0, max), boxShadow: whiteShadow(x, 0, max), border: 'none'}
      }

      // set animation height per key
      heights[note] = {height: calculateHeight(x, 0, max)}
    }
    return { heights, colors }
  }, [pressed])

  const pianoStyles = toggle ? colors : heights

  return (
    <React.Fragment>
      <Container maxWidth="xl" className={styles.buttons}>
        <Button onClick={switchType}>
          Switch to: {!toggle ? 'Heat Map' : 'Piano Graph'}
        </Button>
        <Button style={{float: 'right'}} onClick={clear}>
          Clear
        </Button>
      </Container>

      <Container maxWidth={null} className={styles.root}>
        <Piano startNote="A0" endNote="C8" styles={pianoStyles} />
      </Container>
    </React.Fragment>
  )
}

// css styling per key stroke
function whiteShadow(x, min, max) {
	let minmax = x/max
	return `-1px -1px 2px rgba(255,255,255,0.2) inset, 0 0 4px 1px rgba(190,30,30,0.6) inset, 0 0 ${minmax*8}px ${minmax*3}px rgba(255,${(1-minmax)*255},${(1-minmax)*255},${minmax*0.2})`
}

function colorWhiteKeys(x, min, max) {
	let normalized = max < 255 ? 255-x : (1 - (x/max)) * 255
	return `rgb(255,${normalized},${normalized})`
}

function colorBlackKeys(x, min, max) {
	let normalized = max < 255 ? x : x/max * 255
	return `rgb(${normalized},0,0)`
}

function calculateHeight(x, min, max) {
	let minmax = x/max
	return `${minmax*15 + 10}vw`
}  
  
export { default as config } from './config'
