import { useEffect } from 'react'
import { useSetting, useToggleStatusBarVisibility } from '../../../api/settings'
import { useMidiOutputs } from '../../../api/midi'
import { useLastEvent, useSendEvent, useShouldSendOutputEvent } from '../../../api/events'

export default function () {
  const lastEvent = useLastEvent()
  const toggleStatusBarVisibility = useToggleStatusBarVisibility()
  const midiOutputs = useMidiOutputs()
  const [activeOutputs] = useSetting('activeOutputs', [])
  const [transpose] = useSetting('transpose', 0)
  const shouldSendOutputEvent = useShouldSendOutputEvent()
  const sendEvent = useSendEvent()

  // toggle hide/show status bar
  useEffect(() => {
    toggleStatusBarVisibility(!!activeOutputs.length)
  }, [activeOutputs, toggleStatusBarVisibility])

  // send output to devices
  useEffect(() => {
    if (!lastEvent || !activeOutputs) {
      return
    }

    if (shouldSendOutputEvent) {
      lastEvent.direction = 'output'
      sendEvent(lastEvent._data, 'output')
    }

    const data = [...lastEvent._data]
    data[1] = Math.max(0, Math.min(127, data[1] + transpose * 2))
    midiOutputs
      .filter(p => activeOutputs.indexOf(p.id) !== -1)
      .filter(p => lastEvent.source.type !== 'midi' 
        // compare by name because ID isn't the same for inputs and outputs
        || lastEvent.source.name !== p.name)
      .forEach(o => o.send(data))
  }, [lastEvent, activeOutputs, midiOutputs, transpose])
  
  return null
}
