import React from 'react'
import { useChords } from '../utils'

export default React.memo(function () {
  const [chords, id] = useChords()
  const detection = chords.length ? chords[0] : <i style={{color: '#ccc'}}>chord</i>
  return <span>{detection}</span>
})
