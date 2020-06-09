import { useEffect } from 'react'
import NoSleep from 'nosleep.js'

export function useNoSleep() {
  useEffect(() => {
    const noSleep = new NoSleep()
    noSleep.enable()
    return () => 
      noSleep.disable()
  }, [])
}
