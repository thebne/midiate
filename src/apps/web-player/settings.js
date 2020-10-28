import { useSetting, useSessionValue } from '../../api/settings'

export const useInstrumentType = () =>
  useSetting('instrumentType', 'acoustic_grand_piano')
export const useLoading = () =>
  useSessionValue('loading', true)
export const useTranspose = () => 
  useSetting('transpose', 0)
