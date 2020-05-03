import React, { Fragment, useEffect, useState } from 'react'
import Piano from '../../../gadgets/piano/src'
import { makeStyles } from '@material-ui/core/styles'
import { zip } from './utils'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

const ANIMATION_DURATION_S = 15
const MATRIX_REGEX = new RegExp(/matrix\((.+?)\)/)

const useStyles = makeStyles(theme => ({

  transform: {
    position: "absolute",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flexEnd',
    width: "100%",
    left: 0,
    top: '-.5vh',
    zIndex: 100,
  },

  body: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    minHeight: '.6em',
    backgroundColor: "#d10",
    border: '1px solid #222',
    borderRadius: '.2vw',
    transition: `height ${ANIMATION_DURATION_S}s linear, top ${ANIMATION_DURATION_S}s linear, background-color 200ms linear`,
    willChange: "height, top, background-color",
  },

  "animation-enter": {
    "& $body": {
      height: 0,
      top: 0,
      backgroundColor: '#392',
    },
  },
  "animation-enter-active": {
    "& $body": {
      backgroundColor: '#3f2',
      height: '100em',
      top: '-100em',
    },
  },
  "animation-exit":{
    "& $body": {
      height: '100em',
      top: '-100em',
      backgroundColor: '#3f2',
    }
  },
  "animation-exit-active": {
    "& $body": {
      height: '100em',
      top: '-100em',
      backgroundColor: '#d10',
      transition: `height ${ANIMATION_DURATION_S}s linear, top ${ANIMATION_DURATION_S}s linear, background-color ${ANIMATION_DURATION_S / 2}s linear`,
    }
  },
}))

export default function PianoSimulator ({ notes }) {
  // create an Object of {note: "pressed", note: "pressed", ...} for each pressed note
  const pressedClasses = Object.fromEntries(zip([notes, Array(notes.length).fill("pressed")]))
  // create an Object of {note: {pressed: true}, note: {pressed: true}, ...} for each pressed note
  const pressedProps = Object.fromEntries(zip([notes, Array(notes.length).fill({pressed: true})]))
  return (
    <Fragment>
      <Piano 
        NoteEffectComponent={NoteAnimation} 
        NoteEffectProps={pressedProps}
        classNames={pressedClasses} 
        startNote="A0" endNote="C8"
      />
    </Fragment>
  )
}

const NoteAnimation = React.memo(({pressed}) => {
  const classes = useStyles()
  const [animationTime, setAnimationTime] = useState(null)
  
  useEffect(() => {
    setAnimationTime(time => {
      if (pressed) {
        if (time == null) {
          // new note-on event
          return new Date().getTime()
        }
        return time
      }
      if (time === null) {
        // note-off, but it's already off
        return time
      }
      // note-off with current animation active
      return null
    })
  }, [pressed])

  const applyFixedTransform = node => {
    const body = node.getElementsByClassName(classes.body)[0]
    const {height} = window.getComputedStyle(body)
    body.style.maxHeight = `${height}`
  }


  return (
    <TransitionGroup component={null}>
      {animationTime !== null &&
        <CSSTransition
          key={animationTime}
          timeout={ANIMATION_DURATION_S * 1000 / 2}
          classNames={{
            enter: classes['animation-enter'],
            enterActive: classes['animation-enter-active'],
            exit: classes['animation-exit'],
            exitActive: classes['animation-exit-active'],
          }}
          onExit={applyFixedTransform}
        >
          <div className={classes.transform}> 
            <div className={classes.body} />
          </div>
        </CSSTransition>
      }
  </TransitionGroup>
  )
})


// midiate support
export { default as config } from './midiate/config'
export { default as StatusBar } from './midiate/statusBar'
export { default as createSelectors } from './midiate/selectors'
