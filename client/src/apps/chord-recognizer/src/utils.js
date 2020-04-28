export const arePropsEqual = (prevProps, nextProps) => {
  // compare to avoid re-rendering
  return prevProps.chords.id === nextProps.chords.id 
    && prevProps.chords.detection[0] === nextProps.chords.detection[0]
}
