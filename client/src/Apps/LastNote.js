import React, { Fragment } from 'react'
import Piano from '../Generic/Piano'


const zip = rows=>rows[0].map((_,c)=>rows.map(row=>row[c]))


export default class LastNote extends React.Component {
  render() {
		const pianoClasses = Object.fromEntries(zip([this.props.currentlyPlayed, Array(this.props.currentlyPlayed.length).fill("active")]))
    return <Fragment>
			<Piano classes={pianoClasses} startNote="A0" endNote="C8" />
      </Fragment>

    /*

      <h1>{this.props.lastEvent ? this.props.lastEvent.note : null}</h1>
      <pre>{JSON.stringify(this.props.lastEvent)}</pre>
      */
  }
}

export function StatusBar({lastEvent}) {
  return <Fragment>
          {lastEvent && lastEvent.note
            ? lastEvent.note 
            : <i style={{color: '#ccc'}}>note</i>}
    </Fragment>
}

export function config() {
  return {name: "Last Note"}
}

export let createSelectors = (selectors, state) => ({ 
	lastEvent : selectors.getLastEvent(state),
	currentlyPlayed: selectors.getCurrentlyPlayed(state) 
})
