import assignedNotes from './assign'

let isActive = false
export const getIsActive = () => isActive
export const setIsActive = (flag) => {
  Object.values(assignedNotes).forEach(([, visualization]) => {
    visualization.style.display = flag ? 'inherit' : 'none'
  })
  isActive = flag
}
