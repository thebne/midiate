import { useSetting } from '../../api/settings'

export const useScale = () =>
  useSetting('scale', {})
