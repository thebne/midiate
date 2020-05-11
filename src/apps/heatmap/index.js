import React, { useEffect, useState } from 'react'
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

  useEffect(() => {	 
	 // show animation only for note press
	 if (!lastEvent || lastEvent.messageType !== 'noteon') {
		return 
	 }

   setPressed(pressed => {
     let newPressed = {...pressed}
     // update note frequency dict
     let n = lastEvent.note	
     if (newPressed[n]) {
       newPressed[n] += 15	
     }
     else {
       newPressed[n] = 1
     }
     return newPressed
   })
  }, [lastEvent, setPressed])

  return null
}

export default function Heatmap() {
  const [pressed,setPressed] = usePressed()
  const [toggle, setToggle] = useToggle()

  const heights = {}, colors = {}
  const max = Math.max(...Object.values(pressed))

	for (const [note, x] of Object.entries(pressed)) {			
		// set color styling per key type (black/white)
		if (Note.accidentals(Note.simplify(note)).length) {
			colors[note] = {background: colorBlackKeys(x,0,max),  border: colorBlackKeys(x,0,max)}
		}
		else {
			colors[note] = {background: colorWhiteKeys(x,0,max), boxShadow: whiteShadow(x,0,max), border: 'none'}
		}
		
		// set animation height per key
		heights[note] = {height: calculateHeight(x,0,max)}
	}	
    return (
      <Container maxWidth="xl" className={styles.root}>
        <Button onClick={() => setToggle(t => !t)}>
          Switch to: {!toggle ? 'Heat Map' : 'Piano Graph'}
        </Button>
        <Button style={{float: 'right'}} onClick={() => setPressed({})}>
          Clear
        </Button>			

        <Piano startNote="A0" endNote="C8" styles={toggle ? colors : heights} />
      </Container>
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
  
// midiate support
export { default as config } from './midiate/config'
