import { useSessionValue } from '../../api/settings'

export const useChordHistory = () =>
  useSessionValue('chordHistory', [])
