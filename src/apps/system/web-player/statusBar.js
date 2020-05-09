import React from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import { green, red, yellow } from '@material-ui/core/colors'
import { useInstrumentType, useLoading } from './settings'

export default function StatusBar () {
  const [loading] = useLoading()
  const [type] = useInstrumentType()

  const color = loading 
    ? (type ? yellow[400] : red[400]) : green[400]
  const status = (loading || !type) 
    ? (type ? `loading ${type}` : 'offline') : type

  return (
    <React.Fragment>
      <Tooltip title={status} arrow enterDelay={0}>
        <PlayCircleFilledIcon
          style={{ color }} />
      </Tooltip>
    </React.Fragment>
  )
}
