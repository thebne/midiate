import React from 'react'
import KeyboardHandler from './handlers/keyboardHandler'
import WebHandler from './handlers/webHandler'

export default function () {
  return (
    <React.Fragment>
      <WebHandler />		
      <KeyboardHandler />
    </React.Fragment>
  )
}
