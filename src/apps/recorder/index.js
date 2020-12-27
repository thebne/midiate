import React, { useCallback, useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import MicIcon from '@material-ui/icons/Mic'
import { red, grey } from '@material-ui/core/colors'
import { useLastEvent } from '../../api/events'
import { useToggleStatusBarVisibility, 
  useSessionValue } from '../../api/settings'
const writeMidi = require('midi-file').writeMidi

const useEventHistory = () => 
  useSessionValue('eventHistory', [])
const useStartTime = () => 
  useSessionValue('startTime', null)
const useShouldRecord = () => 
  useSessionValue('shouldRecord', false)

function saveByteArray(reportName, byte) {
  var blob = new Blob([byte], {type: "audio/midi"});
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  var fileName = reportName;
  link.download = fileName;
  link.click();
}
const dtf = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric', 
  minute: 'numeric', 
  second: 'numeric',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})
const formatDate = date => dtf.format(date).replace(/(\/|:|, )/g, "-")

export default function () {
  const [eventHistory, setEventHistory] = useEventHistory()
  const [shouldRecord, setShouldRecord] = useShouldRecord()
  const [startTime,] = useStartTime()

  const downloadFile = useCallback(() => {
    const output = writeMidi({
      header: {
        // 1 tick = 1ms = 1000 microseconds = 500,000 / 500
        //. (default tempo, with no SetTempo message, is 500,000)
        ticksPerBeat: 500,
      },
      tracks: [
        eventHistory.map(e => {
          switch (e.messageType) {
            case 'noteon':
              return {
                type: 'noteOn',
                noteNumber: e.key,
                velocity: e.velocity,
                deltaTime: e.deltaTime,
              }
            case 'noteoff':
              return {
                type: 'noteOff',
                noteNumber: e.key,
                velocity: e.velocity,
                deltaTime: e.deltaTime,
              }
            default:
              console.warn('currently support only note-on and note-off')
              return null
          }
        }).filter(x => x !== null).concat({
          deltaTime: 0,
          meta: true,
          type: 'endOfTrack',
        })
      ]
    })
    const name = `${formatDate(startTime)}_${formatDate(new Date())}_${eventHistory.length}.mid`
    saveByteArray(name, new Uint8Array(output))

  }, [eventHistory, startTime])

  // refresh every second
  const [,setTick] = useState({})
  useEffect(() => {
    const interval = setInterval(() => setTick({}), 1000)
    return () => clearInterval(interval)
  }, [setTick])

  return (
    <Container>
      <Button onClick={() => setShouldRecord(x => !x)}>
        {shouldRecord ? 'Pause' : 'Start'}
      </Button>
      <Button onClick={() => setEventHistory([])}>
        Clear
      </Button>
      <Button onClick={downloadFile} 
        size="large" variant="contained" color="primary" 
        disabled={eventHistory.length === 0}
      >
        Download MIDI
      </Button>
      <Typography variant="h4">
        Recorded {eventHistory.length} events
      </Typography>
      {startTime && 
        <Typography variant="h4">
          for {parseInt((new Date().getTime() - startTime) / 1000)} seconds 
        </Typography>
      }
    </Container>
  )
}

/* collect notes even when not on main app view */
export function BackgroundTask() {
  const lastEvent = useLastEvent()
  const toggleStatusBarVisibility = useToggleStatusBarVisibility()
  const [shouldRecord,] = useShouldRecord()
  const [eventHistory, setEventHistory] = useEventHistory()
  const [startTime, setStartTime] = useStartTime()

  // toggle hide/show status bar
  useEffect(() => {
    toggleStatusBarVisibility(shouldRecord || eventHistory.length)
  }, [shouldRecord, eventHistory.length, toggleStatusBarVisibility])

  // set start time 
  useEffect(() => {
    if (!shouldRecord) {
      setStartTime(null) 
      return
    }
    setStartTime(new Date().getTime())
  }, [setStartTime, shouldRecord])

  // add to history whenever a new event is sent 
  useEffect(() => {
    if (!lastEvent || !shouldRecord || !startTime
      || startTime >= lastEvent.receivedTime)
      return

    setEventHistory(eventHistory => {
      const newHistory = [...eventHistory]
      return newHistory.concat(lastEvent)
    })
  }, [lastEvent, setEventHistory, shouldRecord, startTime])

  return null
}

export function StatusBar() {
  const [eventHistory,] = useEventHistory()
  const [shouldRecord,] = useShouldRecord()
  const [tick, setTick] = useState(true)
  useEffect(() => {
    const interval = setInterval(() => setTick(t => !t), 700)
    return () => clearInterval(interval)
  }, [setTick])

  if (!shouldRecord && !eventHistory.length)
    return null

  return <MicIcon style={{ 
          color: shouldRecord ? red[400] : grey[400], 
           visibility: shouldRecord ? (tick ? 'visible' : 'hidden') : 'visible', 
         }} /> 
}

export const config = {
  id: "RECORDER",
  name: "Recorder",
  icon: MicIcon,
}
