import React, { useLayoutEffect, useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/lab/Autocomplete'
import clsx from 'clsx'
import { Note, Scale, Midi } from '@tonaljs/tonal'
import Piano from '../../gadgets/piano'
import { useNotes, useLastNote } from '../../api/notes'
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

  timer: {
    position: 'fixed',
    top: '20%',
    left: '40%',
    fontSize: 15,
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

export default function ScaleSprint () {
  const classes = useStyles()
  const sendEvent = useSendEvent()
  const notes = useNotes()
  const [scale,] = useScale()
  const [noteIndex, setNoteIndex] = useState(0)
  const lastNote = useLastNote()
  const lastScale = usePrevious(scale)

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

  const noteQueue = useMemo(() => {
    const allowedNotes = Scale.get(`${scale.pitchClass}1 ${scale.name}`).notes.map(n => Note.pitchClass(Midi.midiToNoteName(Midi.toMidi(n))))

    const queue = []
    for (var i = 2; i < 6; i++) {
      allowedNotes.forEach(note => queue.push(note + i.toString()))
    }
    return queue
    }
  , [scale])

  // progress the queue with correct/incorrect presses
  useEffect(() => {
    if (lastNote === null)
      return

    setNoteIndex(i => {
      if (lastNote === noteQueue[i]) {
        return i + 1
      }
      
      return 0
    })
  }, [lastNote, noteQueue])


  return (
    <React.Fragment> 
      <ScaleSelect />
      <ScaleCounter 
        current={noteQueue[noteIndex]} 
        started={scale != null && noteIndex !== 0} 
        finished={noteQueue.length > 0 && noteIndex === noteQueue.length}
        failed={scale != null && noteIndex === 0 && lastScale === scale} 
      />
      <Piano 
        NoteEffectProps={pressedProps}
        classNames={{...pressedClasses, ...highlightClasses}} 
        startNote="C2" endNote="C6"
        onPress={onPress}
        onRelease={onRelease}
      />
    </React.Fragment>
  )
}

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
    <React.Fragment>
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
    </React.Fragment>
  )
})

function ScaleCounter({started, current, finished, failed}) {    
  const classes = useStyles()

  return (
    <div className={classes.timer}>
      <h1>{current != null ? current : "Select scale"}</h1>
      <Stopwatch started={started} ended={finished || failed} />
      {finished && <div style={{color: 'green'}}>aye rufus!</div>}
      {failed && <div style={{color: 'red'}}>booz leha!</div>}
    </div>
  )
}

function Stopwatch({started, ended}) {
  const [startTime, setStartTime] = useState(new Date().getTime())
  const endTime = useMemo(() => new Date().getTime(), [ended])
  
  useEffect(() => {
    setStartTime(startTime => 
      !started ? startTime : new Date().getTime()
    )
  }, [started])

  // force re-rendering of component
  const [_, refresh] = useState({})
  useEffect(() => {
    const interval = setInterval(() => refresh({}), 35)
    return () => clearInterval(interval)
  }, [])

  let timeDiff
  if (started && !ended)
    timeDiff = new Date().getTime() - startTime
  else 
    timeDiff = endTime - startTime

  const ms = timeDiff % 1000
  let s = parseInt(timeDiff / 1000)

  return (
    <React.Fragment>
      {(started || ended) && <h1>Time: {s}:{pad(ms, 3)}</h1>}
      {(!started || ended) && <h1>Hit to start</h1>}
    </React.Fragment>
  )
}

function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export { default as config } from './config'
export { default as StatusBar } from './statusBar'
