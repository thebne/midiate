export const getUiState = store => store.ui

export const getRunningApps = store => getUiState(store) ? getUiState(store).runningApps : {}
export const getForegroundApp = (store) => getUiState(store) ? getUiState(store).foregroundApp : null

export const getCurrentlyPlayed = store => {
    let s = new Set()
    Object.values(store.events.currentByChannel).forEach(c => {
      c.forEach(n => s.add(n))
    })
    return Array.from(s)
}

export const getLastEvent = store => store.events.lastEvent
