import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { Progression } from "@tonaljs/tonal"
import { detect, arePropsEqual } from '../utils.js'
import store, { connectApp } from '../redux'

const StatusBar = React.memo(connectApp(({notes, 
  detections, chordDetectionRange, relativeScale,
  clearDetections, updateDetection, addDetection}) => {

  // add or remove detections 
  useEffect(() => {
    // if there's a new detection, remove old ones
    if (Object.keys(detections).length && !(notes.id in detections)) {
      clearDetections()
    }

    const [start, end] = chordDetectionRange
    const filtered = notes.events.filter(e => {
      return (start === null || e.key >= start) && (end === null || e.key <= end)
    })
    let detection = detect(filtered.map(e => e.note))
    if (detection.length) {
      if (relativeScale) {
        const roman = Progression.toRomanNumerals(relativeScale, detection)
        detection = [roman[0], detection[0]]
      }
      else {
        if (detection.length === 1 
          || detection[1].length > detection[0].length) {
          detection = [detection[0]]
        }
      }
    }

    if (detection.length) {
      if (!(notes.id in detections)) {
        addDetection({id: notes.id, detection})
      } else {
        updateDetection(notes.id, detection)
      }
    }
  }, [notes,
    // redux
    clearDetections, updateDetection, addDetection, chordDetectionRange,
  ])

  const detection = Object.keys(detections).length ? Object.values(detections)[0].detection[0] : <i style={{color: '#ccc'}}>chord</i>
  return <span>{detection}</span>
}), arePropsEqual)

export default function (props) {
  return (
    <Provider store={store}>
        <StatusBar {...props} />
    </Provider>
  )
}
