import React from 'react'
import Piano from '../Generic/Piano'


const zip = rows=>rows[0].map((_,c)=>rows.map(row=>row[c]))


export default class LastNote extends React.Component {
  render() {
		const pianoClasses = Object.fromEntries(zip([this.props.currentlyPlayed, Array(this.props.currentlyPlayed.length).fill("active")]))
    return <div>
			<Piano classes={pianoClasses} startNote="A0" endNote="C8" />
      </div>

    /*

      <h1>{this.props.lastEvent ? this.props.lastEvent.note : null}</h1>
      <pre>{JSON.stringify(this.props.lastEvent)}</pre>
      */
  }
}

export function config() {
  return {name: "Last Note"}
}

export let createSelectors = (selectors, state) => ({ 
	lastEvent : selectors.getLastEvent(state),
	currentlyPlayed: selectors.getCurrentlyPlayed(state) 
})
