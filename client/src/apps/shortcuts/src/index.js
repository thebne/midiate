import React from 'react'
import './style.module.css'

export * from './mutator'
  
// midiate support
export default () => {
  return <div>Help for shortcuts go here</div>
}
export { default as config } from './midiate/config'
export { default as StatusBar } from './midiate/statusBar'
export { default as createSelectors } from './midiate/selectors'
