import { useCallback, useEffect, useState } from 'react'
import Soundfont from 'soundfont-player'
import { useLastEvent } from '../../api/events'
import { useToggleStatusBarVisibility } from '../../api/settings'
import { useInstrumentType, useLoading } from './settings'

export default function () {
  const lastEvent = useLastEvent()
  const toggleStatusBarVisibility = useToggleStatusBarVisibility()
  const [type] = useInstrumentType()
  const [loading, setLoading] = useLoading()
  const [instrument, setInstrument] = useState(null)
  const [, setPlaying] = useState({})

  const playSound = useCallback(lastEvent => {
    if (loading || !instrument || !type)
      return

    setPlaying(playing => ({
      ...playing,
      [lastEvent.note]: instrument.start(lastEvent.note, null, {
        loop: true,
        gain: lastEvent.velocity / 127
      }),
    }))
  }, [loading, instrument, setPlaying, type])

  const stopSound = useCallback(lastEvent => {
    if (loading || !instrument || !type)
      return

    setPlaying(playing => {
      let node = playing[lastEvent.note]
      if (!node) {
        // can't find any specific note, stop everything
        instrument.stop()
        return {}
      }
      node.stop()
      const newPlaying = {...playing}
      delete newPlaying[lastEvent.note]
      return newPlaying
    })
  }, [loading, instrument, setPlaying, type])

  // toggle hide/show status bar
  useEffect(() => {
    toggleStatusBarVisibility(!!type)
  }, [type, toggleStatusBarVisibility])

  // send output to devices
  useEffect(() => {
    setLoading(true)
    if (!type) {
      return
    }
    Soundfont.instrument(new AudioContext(), type).then(function (instrument) {
      setInstrument(instrument)
      setLoading(false)
    })
  }, [type, setInstrument, setLoading])

  useEffect(() => {
    if (!lastEvent)
      return 

    if (lastEvent.messageType === 'noteon') {
      playSound(lastEvent)
    } else if (lastEvent.messageType === 'noteoff') {
      stopSound(lastEvent)
    }
  }, [lastEvent, playSound, stopSound])
  
  return null
}
