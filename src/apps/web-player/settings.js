import { useSetting, useSessionValue } from '../../api/settings'

export const useInstrumentType = () =>
  useSetting('instrumentType', null)
export const useLoading = () =>
  useSessionValue('loading', true)
