import React from 'react'

export default class LastNote extends React.Component {
  render() {
    return <div>
      <h1>{this.props.lastEvent.note}</h1>
      <pre>{JSON.stringify(this.props.lastEvent)}</pre>
      </div>
  }

  // TODO move to config.json
}

export function config() {
  return {name: "Last Note"}
}

export let createSelectors = (selectors, state) => ({ lastEvent : selectors.getLastEvent(state) })
