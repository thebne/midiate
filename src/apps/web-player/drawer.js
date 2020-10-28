import React from 'react'
import Badge from '@material-ui/core/Badge'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import { green, yellow } from '@material-ui/core/colors'
import { useInstrumentType, useLoading, useTranspose } from './settings'

export default function DrawerItem() {
  const [loading] = useLoading()
  const [type] = useInstrumentType()
  const [transpose] = useTranspose()
  
  if (!type)
    return null

  const color = loading ? yellow[400] : green[400]
  const status = loading ? `Loading ${type}` : `Playing ${type}`

  const transposeString = transpose > 0 ? `+${transpose}` : transpose.toString()

  return (
    <React.Fragment>
      <ListItemIcon>
        <Badge badgeContent={transposeString} color="primary" invisible={!transpose}>
          <PlayCircleFilledIcon
            style={{ color }} />
        </Badge>
      </ListItemIcon>
      <ListItemText primary={status} secondary="Web Player" />
    </React.Fragment>
  )
}
