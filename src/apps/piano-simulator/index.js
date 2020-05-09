import React, { useCallback } from 'react'
import Piano from '../../gadgets/piano'
import { makeStyles } from '@material-ui/core/styles'
import { zip } from './utils'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { useNotes } from '../../api/notes'

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
}))

export default function PianoSimulator () {
  const notes = useNotes()

  // create an Object of {note: "pressed", note: "pressed", ...} for each pressed note
  const pressedClasses = Object.fromEntries(zip([notes, Array(notes.length).fill("pressed")]))
  // create an Object of {note: {pressed: true}, note: {pressed: true}, ...} for each pressed note
  const pressedProps = Object.fromEntries(zip([notes, Array(notes.length).fill({pressed: true})]))
  return (
    <Piano 
      NoteEffectComponent={NoteAnimation} 
      NoteEffectProps={pressedProps}
      classNames={pressedClasses} 
      startNote="A0" endNote="C8"
    />
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

export { default as config } from './midiate/config'
export { default as StatusBar } from './midiate/statusBar'
