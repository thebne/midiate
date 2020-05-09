import { useEffect, useState } from 'react'
import Soundfont from 'soundfont-player'
import { useLastEvent } from '../../../api/events'
import { useInstrumentType, useLoading } from './settings'

const audioContext = new AudioContext()

export default function StatusBar () {
  const lastEvent = useLastEvent()
  const [type] = useInstrumentType()
  const [loading, setLoading] = useLoading()
  const [instrument, setInstrument] = useState(null)
  const [, setPlaying] = useState({})

  // send output to devices
  useEffect(() => {
    setInstrument(null)
    setLoading(true)
    if (!type) {
      return
    }
    Soundfont.instrument(audioContext, type).then(function (instrument) {
      setInstrument(instrument)
      setLoading(false)
    })
  }, [type, setInstrument, setLoading])


  useEffect(() => {
    if (loading || !lastEvent || !instrument || !type)
      return

    if (lastEvent.messageType === 'noteon') {
      setPlaying(playing => ({
        ...playing,
        [lastEvent.note]: instrument.play(lastEvent.note),
      }))
    }
  }, [lastEvent, instrument, setPlaying, type, loading])

  useEffect(() => {
    if (loading || !lastEvent || !instrument || !type)
      return

    if (lastEvent.messageType === 'noteoff') {
      setPlaying(playing => {
        const node = playing[lastEvent.note]
        if (!node)
          return playing
        node.stop()
        const newPlaying = {...playing}
        delete newPlaying[lastEvent.note]
        return newPlaying
      })
    }
  }, [lastEvent, instrument, setPlaying, type, loading])
  
  return null
}
