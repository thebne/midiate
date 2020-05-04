import React, { Fragment, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { getMidiServerHost } from '../redux/selectors'
import { 
  sendServerEvent, setMidiServerConnectionStatus 
} from "../redux/actions"

let connection = {
  host: '',
  socket: null,
}

function ServerHandler({midiServerHost, sendServerEvent,
  setMidiServerConnectionStatus}) {
  const [tick, setTick] = useState(null)

  useEffect(() => {
      if (midiServerHost !== connection.host && connection.socket) {
        connection.socket.close()
        connection.socket = null
      }
      if (!midiServerHost.length) {
        return
      }

      // create a new connection
      connection.host = midiServerHost
      try {
        connection.socket = new WebSocket(`ws://${midiServerHost}/ws/input`)
      } catch (e) {
        setMidiServerConnectionStatus(false)
        console.error('error initializing:', e)
        // TODO render some Toast
        return
      }

      connection.socket.onmessage = async (event) => {
        const buffer = await event.data.arrayBuffer()

        const view = new DataView(buffer)
        const deltaTime = view.getFloat64(0)
        const msg = new Uint8Array(buffer, 8)
        sendServerEvent(deltaTime, msg, midiServerHost)
      }

      connection.socket.onopen = () => {
        setMidiServerConnectionStatus(true)
      }

      connection.socket.onclose = (e) => {
        setMidiServerConnectionStatus(false)
        console.log('Server closed connection, reconnecting in 3 s', e)
        setTimeout(() => setTick({}), 3000)
      }

  }, [midiServerHost, tick, 
    // redux
    sendServerEvent, setMidiServerConnectionStatus])

  return <Fragment />
}

export default connect(
  (state) => ({
    midiServerHost: getMidiServerHost(state),
  }),
  { sendServerEvent, setMidiServerConnectionStatus }
)(ServerHandler)
