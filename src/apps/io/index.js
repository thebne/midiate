import { IO_APP_ID } from '../../constants'
import SettingsInputSvideoIcon from '@material-ui/icons/SettingsInputSvideo'

export const config = {
  id: IO_APP_ID,
  name: "Devices",
  icon: SettingsInputSvideoIcon,
}

export { default as default } from './settings'
export { default as BackgroundTask } from './backgroundTask'
