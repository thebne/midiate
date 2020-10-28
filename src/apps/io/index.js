import { IO_APP_ID } from '../../constants'
import SettingsInputSvideoIcon from '@material-ui/icons/SettingsInputSvideo'

export const config = {
  id: IO_APP_ID,
  name: "Devices",
  description: "MIDI input & output",
  icon: SettingsInputSvideoIcon,
  openInDrawer: true,
}

export { default } from './settings'
export { default as BackgroundTask } from './backgroundTask'
