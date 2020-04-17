import React, { Fragment } from 'react'
import Piano from '@midiate/gadget-piano'
import { zip } from './utils'

export default class PianoSimulator extends React.Component {
  render() {
    const {notes} = this.props
		const pianoClasses = Object.fromEntries(zip([notes, Array(notes.length).fill("active")]))
    return <Fragment>
			<Piano classes={pianoClasses} startNote="A0" endNote="C8" />
      </Fragment>
  }
}

// midiate support
export { default as config } from './midiate/config'
export { default as StatusBar } from './midiate/statusBar'
export { default as createSelectors } from './midiate/selectors'
