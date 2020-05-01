import React, { Fragment } from 'react'
import Piano from '@midiate/gadget-piano'
import { Scale } from "@tonaljs/tonal";
import { zip } from './utils'

export default function ScaleChallenge({notes})  {

  const scaleNotes = Scale.get("c major").notes
  console.log(notes)
  console.log(scaleNotes)

  const pianoClasses = Object.fromEntries(zip([notes, Array(notes.length).fill("active")]))

  console.log(pianoClasses)
  

  return (
    <Fragment>
			<Piano classes={pianoClasses} startNote="C5" endNote="C6" />
    </Fragment>
  )
}

// midiate support
export { default as config } from './midiate/config'
export { default as StatusBar } from './midiate/statusBar'
export { default as createSelectors } from './midiate/selectors'
