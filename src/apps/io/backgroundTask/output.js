import { useEffect } from 'react'
import { useSetting, useToggleStatusBarVisibility } from '../../../api/settings'
import { useMidiOutputs } from '../../../api/midi'
import { useLastEvent, useSendEvent } from '../../../api/events'
import { useActiveOutputs } from '../settings/output'

export default function () {
  const lastEvent = useLastEvent()
  const toggleStatusBarVisibility = useToggleStatusBarVisibility()
  const midiOutputs = useMidiOutputs()
  const [activeOutputs] = useActiveOutputs()
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

    const data = [...lastEvent._data]
    data[1] = Math.max(0, Math.min(127, data[1]))
    midiOutputs
      .filter(p => activeOutputs.indexOf(p.id) !== -1)
      .filter(p => lastEvent.source.type !== 'midi' 
        // compare by name because ID isn't the same for inputs and outputs
        || lastEvent.source.name !== p.name)
      .forEach(o => o.send(data))
  }, [lastEvent, activeOutputs, midiOutputs])
  
  return null
}
