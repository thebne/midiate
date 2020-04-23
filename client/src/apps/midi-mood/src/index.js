import React, { Fragment, useLayoutEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import { Note } from "@tonaljs/tonal"
import Piano from '../../../gadgets/piano/src/index'
import styles from './style.module.css'

/*_event: {data: Uint8Array(3)}
_data: Uint8Array(3) [144, 96, 81]
receivedTime: undefined
_messageCode: 144
channel: 0
messageType: "noteon"
key: 96
velocity: 81
deltaTime:
-3.467920077289659
e+58
note: "C7"
freq: 2093.004522404789
__proto__: Object*/

export default function LastNote(props) {
  const[pressed, setPressed] = useState({})
  const[toggle, setToggle] = useState(false)

  let heights = {}
  let colors = {}
  const { classes } = props;
   
  useLayoutEffect(() => {	 
	 // show animation only for note press
	 if (!props.lastEvent) {
		return
	 }

	// update note frequency dict	
	let n = props.lastEvent	
	pressed[n.note] = n.velocity
		
	setPressed({...pressed})	
  }, [props.lastEvent])  		

	for (const [note, x] of Object.entries(pressed)) {			
		
		// set color styling per key type (black/white)
		if (Note.accidentals(Note.simplify(note)).length) {
			colors[note] = {background: colorBlackKeys(x), height: `${(x/127)+6}vw`, width: `${(x/127)*0.5+0.8}vw`}
		}
		else {
			colors[note] = {background: colorWhiteKeys(x), height: `${(x/127)+10}vw`, width: `${(x/127)+1.5}vw`}
		}
	}	
	return <Container maxWidth={false} style={{backgroundColor: colorWhiteKeys(props.lastEvent.velocity), height: '100%', transition: '0.5s ease-in'}}>
			<Button style={{float: 'right'}} onClick={function(){setPressed({})}}>Clear</Button>			
			<Piano classes={{}} startNote="A0" endNote="C8" styles={colors} />
      </Container>
  }



// css styling per key stroke
function heatMap(x){	
  var h = (1.0 - x/127) * 240  
  return x !== 0 ? `hsl(${h}, 100%, 50%)` : `hsl(${h}, 100%, 100%)`
}

function colorWhiteKeys(x) {
	let normalized = x / 127
	return x !== 0 ? `hsl(${86*(1-normalized)}, 76%, 48%)` : `hsl(100, 100%, 100%)`
}

function colorBlackKeys(x) {
	let normalized = x / 127
	return x !== 0 ? `hsl(${86*(1-normalized)}, 76%, 48%)`  : `hsl(0, 0%, 0%)`
}

// midiate support
export { default as config } from './midiate/config'
export { default as createSelectors } from './midiate/selectors'
// export { default as makeStyles } from './midiate/styles'