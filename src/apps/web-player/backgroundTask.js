import { useCallback, useEffect, useState } from 'react'
import { Midi } from "@tonaljs/tonal"
import Soundfont from 'soundfont-player'
import { useLastEvent } from '../../api/events'
import { useToggleStatusBarVisibility } from '../../api/settings'
import { useInstrumentType, useLoading, useTranspose } from './settings'

export default function () {
  const lastEvent = useLastEvent()
  const toggleStatusBarVisibility = useToggleStatusBarVisibility()
  const [type] = useInstrumentType()
  const [loading, setLoading] = useLoading()
  const [transpose] = useTranspose()
  const [instrument, setInstrument] = useState(null)
  const [, setPlaying] = useState({})

  const playSound = useCallback(lastEvent => {
    if (loading || !instrument || !type)
      return

    const note = Midi.midiToNoteName(lastEvent.key + transpose * 2)

    setPlaying(playing => ({
      ...playing,
      [note]: instrument.start(note, null, {
        loop: true,
        gain: lastEvent.velocity / 127
      }),
    }))
  }, [loading, instrument, setPlaying, type, transpose])

  const stopSound = useCallback(lastEvent => {
    if (loading || !instrument || !type)
      return

    const note = Midi.midiToNoteName(lastEvent.key + transpose * 2)

    setPlaying(playing => {
      let node = playing[note]
      if (!node) {
        // can't find any specific note, stop everything
        instrument.stop()
        return {}
      }
      node.stop()
      const newPlaying = {...playing}
      delete newPlaying[note]
      return newPlaying
    })
  }, [loading, instrument, setPlaying, type, transpose])

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
