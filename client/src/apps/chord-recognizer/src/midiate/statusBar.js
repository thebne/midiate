import React from 'react'
import { arePropsEqual } from '../utils.js'

export default React.memo(({chords}) => {
  const detection = chords.detection.length ? chords.detection[0] : <i style={{color: '#ccc'}}>chord</i>
  return <span>{detection}</span>
}, arePropsEqual)
