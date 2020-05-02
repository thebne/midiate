import React, { Fragment, useEffect, useState } from 'react'
import Piano from '../../../gadgets/piano/src'
import { makeStyles } from '@material-ui/core/styles'
import { zip } from './utils'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

const ANIMATION_DURATION_S = 8

const useStyles = makeStyles(theme => ({
  animationContainer: {
    //position: "absolute",
    //display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    top: "-.5vh",
    left: 0,
  },
  
  animationRender: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    height: ".6vh",
    backgroundColor: "#d10",
    border: "1px solid #222",
    borderRadius: ".3vw",
    animationName: "$grow",
    animationDuration: `${ANIMATION_DURATION_S}s`,
    animationTimingFunction: "linear",
    animationFillMode: "forwards", 
  },
  
  '@keyframes grow': {
    from: {
      height: '.6vh',
      transform: 'translateY(-.6vh)',
    },
    to: {
      height: '100vh', 
      transform: 'translateY(-100vh)',
    }
  },

  "animation-enter": {
    "& > $animationRender": {
      backgroundColor: '#392',
    }
  },
  "animation-enter-active": {
    "& > $animationRender": {
      backgroundColor: '#3f2',
      transition: "background-color 500ms",
    }
  },
  "animation-exit": {
    "& > $animationRender": {
      backgroundColor: '#3f2',
    }
  },
  "animation-exit-active": {
    "& > $animationRender": {
      backgroundColor: '#d10',
      transition: `background-color ${ANIMATION_DURATION_S / 2}s`,
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
  const [animationTime, setAnimationTime] = useState({})
  
  useEffect(() => {
    setAnimationTime(time => {
      if (pressed) {
        if (time.start == null) {
          // new note-on event
          return {start: new Date().getTime()}
        }
        return time
      }
      if (time.start === null) {
        // note-off, but it's already off
        return time
      }
      // note-off with current animation active
      return {...time, end: new Date().getTime()}
    })
  }, [pressed])

  useEffect(() => {
    if (animationTime.end == null) {
      return
    }
    setAnimationTime({})
  }, [animationTime.end])

  return (
    <TransitionGroup component={null}>
      {animationTime.start &&
        <CSSTransition
          key={animationTime.start}
          timeout={ANIMATION_DURATION_S * 1000}
          classNames={{
            enter: classes['animation-enter'],
            enterActive: classes['animation-enter-active'],
            exit: classes['animation-exit'],
            exitActive: classes['animation-exit-active'],
          }}
        >
            <div className={classes.animationContainer}>
              <div className={classes.animationRender} style={{
                maxHeight: animationTime.end === null 
                  ? "inherit" 
                  : Math.min((animationTime.end - animationTime.start) 
                      / 1000 * ANIMATION_DURATION_S * 2, 100) + "vh",
              }} />
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
