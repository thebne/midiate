import React from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import { green, yellow } from '@material-ui/core/colors'
import { useInstrumentType, useLoading } from './settings'

export default function StatusBar () {
  const [loading] = useLoading()
  const [type] = useInstrumentType()
  
  if (!type)
    return null

  const color = loading ? yellow[400] : green[400]
  const status = loading ? `loading ${type}` : type

  return (
    <React.Fragment>
      <Tooltip title={status} arrow enterDelay={0}>
        <PlayCircleFilledIcon
          style={{ color }} />
      </Tooltip>
    </React.Fragment>
  )
}
