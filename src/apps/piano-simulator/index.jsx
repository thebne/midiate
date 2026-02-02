import React, { useLayoutEffect, useState, useMemo, useCallback, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/lab/Autocomplete'
import clsx from 'clsx'
import { Note, Scale, Midi } from '@tonaljs/tonal'
import Piano from '../../gadgets/piano'
import { useNotes } from '../../api/notes'
import { useSendEvent } from '../../api/events'
import { useScale } from './settings'

const ANIMATION_DURATION_S = 15

const useStyles = makeStyles(theme => ({

  transform: {
    position: "absolute",
    width: "100%",
    left: 0,
    top: '-.5vh',
    zIndex: 100,
    contain: 'layout',
    pointerEvents: 'none',
  },

  flex: {
    position: 'absolute',
    width: '100%',
    height: '100em',
    top: '-100em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    contain: 'strict',
  },

  body: {
    width: '100%',
    minHeight: '.6em',
    backgroundColor: "#3f2",
    border: '1px solid #222',
    borderRadius: '.2vw',
  },

  growing: {
    "& $body": {
      animation: `$growHeight ${ANIMATION_DURATION_S}s linear forwards`,
      backgroundColor: '#3f2',
    },
  },

  releasing: {
    "& $flex": {
      animation: `$slideUp ${ANIMATION_DURATION_S}s linear forwards`,
    },
    "& $body": {
      animation: `$fadeColor ${ANIMATION_DURATION_S}s linear forwards`,
    },
  },

  "@keyframes slideUp": {
    "0%": { transform: 'translateY(0)' },
    "100%": { transform: 'translateY(-100em)' },
  },

  "@keyframes growHeight": {
    "0%": { height: 0 },
    "100%": { height: '100em' },
  },

  "@keyframes fadeColor": {
    "0%": { backgroundColor: '#3f2' },
    "100%": { backgroundColor: '#d10' },
  },

  scaleSelect: {
    contain: 'layout',
    position: 'absolute',
    width: '100%',
    padding: '1vw',
    zIndex: 200,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    '& > *': {
      margin: '0 1em',
    }
  },

  autocomplete: {
    flexGrow: .2,
    minWidth: '15em',
  },
  
  highlight: {
    '& .piano-gadget-noteRender': {
      background: '#ffffaa',
    },
    '&.pressed, &:active': {
      '& .piano-gadget-noteRender': {
        background: '#ffffcc',
        boxShadow: "0 0 1px #fff, 0 0 2px #fff, 0 0 3px #fff, 0 0 4px #FFDD1B, 0 0 7px #FFDD1B, 0 0 10px #FFDD1B, 0 0 15px #FFDD1B, 0 0 20px #FFDD1B",
      },
    },
  },
  wrong: {
    '&, &.pressed, &:active': {
      '& .piano-gadget-noteRender': {
        background: '#ee8888',
        boxShadow: "0 0 1px #fff, 0 0 2px #fff, 0 0 3px #fff, 0 0 4px #FF1177, 0 0 7px #FF1177, 0 0 10px #FF1177, 0 0 15px #FF1177, 0 0 20px #FF1177",
      }
    },
  },
}))

export default function PianoSimulator () {
  const classes = useStyles()
  const sendEvent = useSendEvent()
  const notes = useNotes()
  const [scale,] = useScale()

  // mark highlighted notes if scale is selected
  const highlightClasses = useMemo(() => {
    if (!scale.name || !scale.pitchClass) {
      return {}
    }
    const clss = {}
    Scale.get(`${scale.pitchClass}1 ${scale.name}`).notes.forEach(n =>
      clss[Note.pitchClass(Midi.midiToNoteName(Midi.toMidi(n)))] 
        = classes.highlight)
    return clss
  }, [scale, classes.highlight])

  // create an Object of {note: "pressed", note: "pressed", ...} for each pressed note
  const pressedClasses = useMemo(() => {
    const clss = {}
    const hasHighlight = !!Object.keys(highlightClasses).length
    notes.forEach(n =>
      clss[n] = clsx('pressed', hasHighlight
        && {[classes.wrong]: !(Note.pitchClass(n) in highlightClasses)})
    )
    return clss
  }, [notes, highlightClasses, classes.wrong])

  // create an Object of {note: {pressed: true}, ...} for each pressed note
  const pressedProps = useMemo(() => {
    const props = {}
    notes.forEach(n => props[n] = {pressed: true})
    return props
  }, [notes])

  // Memoize the NoteAnimation component with classes baked in
  const NoteAnimationWithClasses = useMemo(() => {
    return React.memo(function NoteAnimationWrapper(props) {
      return <NoteAnimation {...props} classes={classes} />
    })
  }, [classes])

  // send events when piano is pressed
  const onPress = useCallback((n) => 
    sendEvent(new Uint8Array([144, Midi.toMidi(n), 64]))
    , [sendEvent])
  const onRelease = useCallback((n) => 
    sendEvent(new Uint8Array([144, Midi.toMidi(n), 0]))
    , [sendEvent])

  // Memoize merged classNames to avoid creating new object on every render
  const mergedClassNames = useMemo(() =>
    ({...pressedClasses, ...highlightClasses})
  , [pressedClasses, highlightClasses])

  return (
    <React.Fragment>
      <ScaleSelect />
      <Piano
        NoteEffectComponent={NoteAnimationWithClasses}
        NoteEffectProps={pressedProps}
        classNames={mergedClassNames}
        startNote="A0" endNote="C8"
        onPress={onPress}
        onRelease={onRelease}
      />
    </React.Fragment>
  )
}

const NoteAnimation = React.memo(({pressed, classes}) => {
  const [trails, setTrails] = useState([])
  const nextId = useRef(0)
  const activeTrailId = useRef(null)

  // Add new trail when pressed, mark as released when unpressed
  React.useEffect(() => {
    if (pressed) {
      const id = nextId.current++
      activeTrailId.current = id
      setTrails(t => [...t, { id, startTime: Date.now(), released: false }])
    } else if (activeTrailId.current !== null) {
      const releasedId = activeTrailId.current
      activeTrailId.current = null
      setTrails(t => t.map(trail =>
        trail.id === releasedId
          ? { ...trail, released: true, releaseTime: Date.now() }
          : trail
      ))
    }
  }, [pressed])

  // Clean up old trails after they finish animating
  React.useEffect(() => {
    const releasedTrails = trails.filter(t => t.released)
    if (releasedTrails.length === 0) return
    const timeout = setTimeout(() => {
      const now = Date.now()
      setTrails(t => t.filter(trail =>
        !trail.released || now - trail.releaseTime < ANIMATION_DURATION_S * 1000
      ))
    }, ANIMATION_DURATION_S * 1000)
    return () => clearTimeout(timeout)
  }, [trails])

  return (
    <>
      {trails.map(trail => (
        <div
          key={trail.id}
          className={clsx(
            classes.transform,
            trail.released ? classes.releasing : classes.growing
          )}
        >
          <div className={classes.flex}>
            <div
              className={classes.body}
              style={trail.released ? {
                height: `${Math.min((trail.releaseTime - trail.startTime) / 1000 / ANIMATION_DURATION_S * 100, 100)}em`
              } : undefined}
            />
          </div>
        </div>
      ))}
    </>
  )
}, (prev, next) => prev.pressed === next.pressed && prev.classes === next.classes)

// all scales are simply way too much...
//const allScales = Scale.names().sort((a, b) => a.localeCompare(b))
const allScales = [
  'major',
  'minor',
  'blues', 
  'harmonic minor',
  'melodic minor',
  'pentatonic',
  'minor pentatonic',
  'dorian',
  'lydian',
  'mixolydian',
  'locrian',
]
const allNotes = Scale.get('a chromatic').notes

const ScaleSelect = React.memo(function () {
  const classes = useStyles()
  const [scale, setScale] = useScale()
  const [random, setRandom] = useState(null)
  const generateRandom = () => 
    setRandom({
      pitchClass: allNotes[Math.floor(Math.random() * allNotes.length)],
      name: allScales[Math.floor(Math.random() * allScales.length)], 
    })
  useLayoutEffect(() => generateRandom(), [])

  return (
    <div className={classes.scaleSelect}>
      <Autocomplete
        value={scale.pitchClass || null}
        options={allNotes}
        className={classes.autocomplete}
        renderInput={(params) => <TextField {...params} label="Pitch class" variant="outlined" />}
        onChange={(e, v) => {
          if (!v || allNotes.indexOf(v) !== -1)
            setScale(scale => ({...scale, pitchClass: v}))
        }}
      />
      <Autocomplete
        value={scale.name || null}
        options={allScales}
        className={classes.autocomplete}
        renderInput={(params) => <TextField {...params} label="Scale" variant="outlined" />}
        onChange={(e, v) => {
          if (!v || allScales.indexOf(v) !== -1)
            setScale(scale => ({...scale, name: v}))
        }}
      />
      <Button variant='outlined' onClick={() => setScale({})}>
        clear
      </Button>
      {random && 
        <Button variant='outlined' onClick={() => {
          setScale(random)
          generateRandom()
        }}>
          try {random.pitchClass} {random.name}
        </Button>
      }
    </div>
  )
})

export { default as config } from './config'
export { default as StatusBar } from './statusBar'
