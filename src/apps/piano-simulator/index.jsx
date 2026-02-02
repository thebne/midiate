import React, { useLayoutEffect, useState, useMemo, useCallback } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
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
    height: '100em',
    minHeight: '.6em',
    maxHeight: '100em',
    backgroundColor: "#d10",
    border: '1px solid #222',
    borderRadius: '.2vw',
    willChange: "height, background-color",
  },

  "animation-enter": {
    "& $body": {
      height: 0,
      backgroundColor: '#392',
    },
    "& $flex": {
      transform: 'translateY(0)',
    },
  },
  "animation-enter-active": {
    "& $body": {
      transition: `height ${ANIMATION_DURATION_S}s linear, background-color 200ms linear`,
      backgroundColor: '#3f2',
      height: '100em',
    },
  },
  "animation-exit":{
    "& $body": {
      height: '100em',
      backgroundColor: '#3f2',
      transition: `height ${ANIMATION_DURATION_S}s linear, background-color 200ms linear`,
    },
    "& $flex": {
      transform: 'translateY(-100em)',
      transition: `transform ${ANIMATION_DURATION_S}s linear`,
      willChange: 'transform',
    },
  },
  "animation-exit-active": {
    "& $body": {
      height: '100em',
      backgroundColor: '#d10',
      transition: `height ${ANIMATION_DURATION_S}s linear, background-color ${ANIMATION_DURATION_S / 2}s linear`,
    },
    "& $flex": {
      transform: 'translateY(-100em)',
      transition: `transform ${ANIMATION_DURATION_S}s linear`,
      willChange: 'transform',
    },
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

  // create an Object of {note: {pressed: true}, note: {pressed: true}, ...} for each pressed note
  const pressedProps = useMemo(() => {
    const clss = {}
    notes.forEach(n => clss[n] = {pressed: true})
    return clss
  }, [notes])

  // send events when piano is pressed
  const onPress = useCallback((n) => 
    sendEvent(new Uint8Array([144, Midi.toMidi(n), 64]))
    , [sendEvent])
  const onRelease = useCallback((n) => 
    sendEvent(new Uint8Array([144, Midi.toMidi(n), 0]))
    , [sendEvent])

  return (
    <React.Fragment> 
      <ScaleSelect />
      <Piano 
        NoteEffectComponent={NoteAnimation} 
        NoteEffectProps={pressedProps}
        classNames={{...pressedClasses, ...highlightClasses}} 
        startNote="A0" endNote="C8"
        onPress={onPress}
        onRelease={onRelease}
      />
    </React.Fragment>
  )
}

const NoteAnimation = React.memo(({pressed}) => {
  const classes = useStyles()
  
  const applyFixedTransform = useCallback(node => {
    const body = node.getElementsByClassName(classes.body)[0]
    const {height} = window.getComputedStyle(body)
    body.style.maxHeight = `${height}`
  }, [classes])

  return (
    <TransitionGroup component={null}>
      {pressed &&
        <CSSTransition
          key={new Date().getTime()}
          timeout={ANIMATION_DURATION_S * 1000 / 2}
          classNames={{
            enter: classes['animation-enter'],
            enterActive: classes['animation-enter-active'],
            enterDone: classes['animation-enter-active'],
            exit: classes['animation-exit'],
            exitActive: classes['animation-exit-active'],
          }}
          onExit={applyFixedTransform}
        >
          <div className={classes.transform}> 
            <div className={classes.flex}>
              <div className={classes.body} />
            </div>
          </div>
        </CSSTransition>
      }
  </TransitionGroup>
  )
})

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
