import React from 'react'
import ServerHandler from './handlers/serverHandler'
import KeyboardHandler from './handlers/keyboardHandler'
import WebHandler from './handlers/webHandler'

export default function () {
  return (
    <React.Fragment>
      <WebHandler />		
      <KeyboardHandler />
      <ServerHandler />
    </React.Fragment>
  )
}
