import { useCallback, useEffect, useState } from 'react'
import Soundfont from 'soundfont-player'
import { useLastEvent } from '../../../api/events'
import { useInstrumentType, useLoading } from './settings'

export default function () {
  const lastEvent = useLastEvent()
  const [type] = useInstrumentType()
  const [loading, setLoading] = useLoading()
  const [instrument, setInstrument] = useState(null)
  const [, setPlaying] = useState({})

  const playSound = useCallback(lastEvent => {
    if (loading || !instrument || !type)
      return

    setPlaying(playing => ({
      ...playing,
      [lastEvent.note]: instrument.play(lastEvent.note),
    }))
  }, [loading, instrument, setPlaying, type])

  const stopSound = useCallback(lastEvent => {
    if (loading || !instrument || !type)
      return

    setPlaying(playing => {
      const node = playing[lastEvent.note]
      if (!node)
        return playing
      node.stop()
      const newPlaying = {...playing}
      delete newPlaying[lastEvent.note]
      return newPlaying
    })
  }, [loading, instrument, setPlaying, type])

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
  }, [lastEvent])
  
  return null
}
