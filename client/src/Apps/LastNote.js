import React from 'react'
import { connect } from 'react-redux'
import { getLastEvent } from '../redux/selectors'

class LastNote extends React.Component {
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

export default connect(
  (state) => ({ lastEvent : getLastEvent(state) })
)(LastNote)
