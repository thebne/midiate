import { useEffect } from 'react'
import { useSetting, useToggleStatusBarVisibility } from '../../../api/settings'
import { useMidiOutputs } from '../../../api/midi'
import { useLastEvent } from '../../../api/events'

export default function () {
  const lastEvent = useLastEvent()
  const toggleStatusBarVisibility = useToggleStatusBarVisibility()
  const midiOutputs = useMidiOutputs()
  const [activeOutputs] = useSetting('activeOutputs', [])
  const [transpose] = useSetting('transpose', 0)

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
