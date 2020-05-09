import React from 'react'
import { useChords, arePropsEqual } from '../utils'

const Detection = React.memo(function ({chords}) {
  const detection = chords.length ? chords[0] : <i style={{color: '#ccc'}}>chord</i>
  return <span>{detection}</span>
}, arePropsEqual)

export default function StatusBar() {
  const [chords, id] = useChords()
  return <Detection chords={chords} id={id} />
}
