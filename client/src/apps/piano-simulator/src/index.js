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
    width: "100%",
    left: 0,
    top: '-1.8vh',
    height: "1em",
    minHeight: ".2em",
    transformOrigin: 'bottom center',
    zIndex: 100,
  },

  body: {
    borderRight: "3px solid #00000033",
    width: '100%',
    height: '100%',
    backgroundColor: "#d10",
    transition: `background-color ${ANIMATION_DURATION_S / 2}s`,
    willChange: "background-color",
  },

  "animation-enter": {
    transform: 'scaleY(0)',
    transition: 'none',
    "& $body": {
      backgroundColor: '#392',
    },
  },
  "animation-enter-active": {
    "& $body": {
      backgroundColor: '#3f2',
      transition: 'background-color 500ms',
    },
  },
  "animation-in-scene": {
    transform: 'scaleY(100)',
    transition: `transform ${ANIMATION_DURATION_S}s linear`,
    willChange: "transform",
  },
  "animation-exit":{
    "& $body": {
      transform: 'translateY(0)',
      backgroundColor: '#3f2',
    }
  },
  "animation-exit-active": {
    "& $body": {
      backgroundColor: '#d10',
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
    const transform = window.getComputedStyle(node).getPropertyValue('transform')
    const matched = MATRIX_REGEX.exec(transform)
    if (matched && matched[1]) {
      const matrix = matched[1].split(',').map(parseFloat)
      // matrix[3] is scaleY
      let scaleY = matrix[3]
      if (scaleY !== 0) {
        node.style.transform = `translateY(-100em) scaleY(${scaleY})`
        return
      }
    }
    // sometimes getComputedStyle isn't quick enough
    // FIXME solve it in a better way. if translate is applied separately it doesn't happen
    setTimeout(() => applyFixedTransform(node), 100)
  }


  return (
    <TransitionGroup component={null}>
      {animationTime !== null &&
        <CSSTransition
          key={animationTime}
          timeout={ANIMATION_DURATION_S * 1000}
          classNames={{
            enter: classes['animation-enter'],
            enterActive: classes['animation-enter-active'],
            exit: classes['animation-exit'],
            exitActive: classes['animation-exit-active'],
          }}
          onEntering={node => 
            node.className += ' ' + classes['animation-in-scene']}
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
