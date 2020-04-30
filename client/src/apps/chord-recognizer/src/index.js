import React, { Fragment, useLayoutEffect, useState } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { makeStyles } from '@material-ui/core/styles'
import { arePropsEqual } from './utils.js'

const ColorHash = require('color-hash')
const colorHash = new ColorHash({lightness: .5})

const useStyles = makeStyles(theme => ({
  statusBar:  {
    fontFamily: "'Baloo Tamma 2', cursive",
  },
  detection: {
    fontFamily: "'Baloo Tamma 2', cursive",
    transform: "translate(50%, 60%) scale(1)",
  },
  welcome: {
    fontFamily: "'Baloo Tamma 2', cursive",
    animationName: "$welcomeIn",
    animationDuration: "150ms",
    transform: "translate(50%, 80%) scale(1)",
    opacity: 1,
  },

  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  "animation-enter": {
    "& > $detection": {
      transform: "translate(50%, 60%) scale(0)",
    }
  },
  "animation-enter-active": {
    "& > $detection": {
      transform: "translate(50%, 60%) scale(1)",
      transition: "transform 150ms",
    }
  },
  "animation-exit": {
    "& > $detection": {
      transform: "translate(50%, 60%) scale(1)",
    }
  },
  "animation-exit-active": {
    "& > $detection": {
      transform: "translate(50%, -10%) scale(.4)",
      transition: "transform 4s ease-out",
    }
  },
  '@keyframes welcomeIn': {
    from: {
      opacity: 0,
      transform: "translate(50%, 80%) scale(.5)",
    },
    to: {
      opacity: 1,
      transform: "translate(50%, 80%) scale(1)",
    },
  },
}))

export default React.memo(function ChordRecognizer({chords}) {
  const [animations, setAnimations] = useState([])

  // add or remove animation objects
  useLayoutEffect(() => {
    setAnimations(entries => {
      entries = [...entries]
      let prev = entries[entries.length - 1]

      // check if there's an existing detection. if so, remove it
      if (prev && chords.id !== prev.id) {
        setAnimations((entries) => {
          entries = [...entries]
          entries.splice(entries.indexOf(prev), 1)
          return entries 
        })
      }
      // add new detections
      if ((!prev || prev.id !== chords.id) && chords.detection.length) {
        entries.push({...chords, time: new Date().getTime()})
      }
      // update existing detection
      else if (prev && prev.id === chords.id && chords.detection.length) {
        prev.detection = chords.detection
	  }
	  
      return entries
    })
  }, [chords])

	return (
    <Fragment>
      <Welcome />
      <Animations>{animations}</Animations>
    </Fragment>
	)
}, arePropsEqual)

function Welcome() {
  const classes = useStyles()
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={classes.svg}>
      <g className={classes.welcome}>
        <text 
        fill="#bbb" 
        fontSize={12}
        style = {{
          dominantBaseline: "middle",
          textAnchor: "middle",
        }}>
          Play some chords!
        </text>
      </g>
    </svg>
  )
}

function Animations({children}) {
  const classes = useStyles()
  return (
    <TransitionGroup enter component={null}>
    {children.map((animation) => {
      const [main, ...rest] = animation.detection
      // render SVG for each object because react-transition-group renders the elements in reverse order,
      // which doesn't allow to create zIndex-like new-chord-first hierarchy
      return (
        <CSSTransition
          key={animation.id}
          timeout={4000}
          classNames={{
            enter: classes['animation-enter'],
            enterActive: classes['animation-enter-active'],
            exit: classes['animation-exit'],
            exitActive: classes['animation-exit-active'],
          }}
          >
          <svg 
            viewBox="0 0 100 100" 
            className={classes.svg}
            style={{
              zIndex: 100 + animation.id,
              }} >
            <g 
              className={classes.detection}>
              <ellipse rx={20} ry={10}
                fill={colorHash.hex(main.split("/")[0])} />
              <text 
              fill="white" 
              fontSize={6}
              style = {{
                dominantBaseline: "middle",
                textAnchor: "middle",
              }} >
                {main}
              </text>
              {rest.map((secondary, i) => (
                <text 
                  key={secondary}
                  fill="white" 
                  fontSize={3}
                  y={2 * (i + 1)}
                  style = {{
                    dominantBaseline: "hanging",
                    textAnchor: "middle",
                  }} >
                    {secondary.length === main.length ? secondary : ''}
                </text>)
                )}
            </g>
          </svg>
        </CSSTransition>
      )
    })}
  </TransitionGroup>
  )
}

// midiate support
export { default as config } from './midiate/config'
export { default as StatusBar } from './midiate/statusBar'
export { default as createSelectors } from './midiate/selectors'
