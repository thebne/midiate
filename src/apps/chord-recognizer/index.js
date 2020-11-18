import React, { Fragment, useEffect, useState } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import Dialog from '@material-ui/core/Dialog'
import Container from '@material-ui/core/Container'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import EditIcon from '@material-ui/icons/Edit'
import StarIcon from '@material-ui/icons/Star'
import SettingsIcon from '@material-ui/icons/Settings'
import { makeStyles } from '@material-ui/core/styles'
import { Scale, Midi } from '@tonaljs/tonal'
import { useChords, arePropsEqual } from './utils'
import { useChordHistory } from './settings'
import { useSetting } from '../../api/settings'
import { useNoSleep } from '../../api/misc'

const ColorHash = require('color-hash')
const colorHash = new ColorHash({lightness: .5})

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: "flex",
    flexDirection: "column",
  },
  page: {
    flexGrow: 1,
    position: 'relative',
  },
  detection: {
    fontFamily: "'Baloo Tamma 2', cursive",
    transform: "translate(50%, 50%) scale(1)",
  },
  smallDetection: {
    fontFamily: "'Baloo Tamma 2', cursive",
    transform: "translateY(10%) scale(.25)",
  },
  welcome: {
    fontFamily: "'Baloo Tamma 2', cursive",
    animationName: "$welcomeIn",
    animationDuration: "150ms",
    transform: "translate(50%, 70%) scale(1)",
    opacity: 1,
  },
  history: {
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
      transform: "translate(50%, 50%) scale(0)",
    }
  },
  "animation-enter-active": {
    "& > $detection": {
      transform: "translate(50%, 50%) scale(1)",
      transition: "transform 150ms",
    }
  },
  "animation-exit": {
    "& > $detection": {
      transform: "translate(50%, 50%) scale(1)",
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

export default function App() {
  const classes = useStyles()
  const [page, setPage] = useState('front')

	return (
    <div className={classes.root}>
      <Container className={classes.page}>
        {page === 'front' &&
          <FrontPage />}
        {page === 'settings' &&
          <SettingsPage />}
      </Container>
      <BottomNavigation
        value={page}
        onChange={(event, newValue) => {
              setPage(newValue)
            }}
        showLabels
      >
        <BottomNavigationAction label="Main" value="front" 
          icon={<StarIcon />} />
        <BottomNavigationAction label="Settings" value="settings" 
          icon={<SettingsIcon />} />
      </BottomNavigation>
    </div>
	)
}

function FrontPage() {
  const [chords, id] = useChords()
  useNoSleep()

	return (
    <Fragment>
      <Welcome />
      <History />
      <Animations chords={chords} id={id} />
    </Fragment>
	)
}

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
function History() {
  const classes = useStyles()
  const [chordHistory,] = useChordHistory()
  if (!chordHistory.length)
    return null
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={classes.svg}>
      <g className={classes.history}>
        <text 
        fill="#bbb" 
        fontSize={7}
        style = {{
          dominantBaseline: "middle",
          textAnchor: "middle",
        }}>
          History:
        </text>
        <g>
          {chordHistory.map(({chords, id}, i) => 
            <g key={id} style={{transform: `translateX(${(i - 5) * 12}%)`}}>
              <g className={classes.smallDetection}>
                <text 
                  fill={colorHash.hex(chords[0].split("/")[0])}
                  fontSize={10}
                  style = {{
                    dominantBaseline: "middle",
                    textAnchor: "middle",
                  }}
                >
                  {chords[0]}
                </text>
              </g>
            </g>
          )}
        </g>
      </g>
    </svg>
  )
}

const Animations = React.memo(function({chords, id}) {
  const classes = useStyles()
  const [main, ...rest] = chords 

  return (
    <TransitionGroup enter component={null}>
    {chords.length && 
      // render SVG for each object because react-transition-group renders the elements in reverse order,
      // which doesn't allow to create zIndex-like new-chord-first hierarchy
        <CSSTransition
          key={id}
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
              zIndex: 100 + id,
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
                  {secondary}
                </text>)
                )}
            </g>
          </svg>
        </CSSTransition>}
  </TransitionGroup>
  )
}, arePropsEqual)

function SettingsPage() {
  const [chordDetectionRange, setChordDetectionRange] 
    = useSetting('chordDetectionRange', [null, null])
  const [relativeScale, setRelativeScale] 
    = useSetting('relativeScale', false)

  const [showRangeDialog, setShowRangeDialog] = useState(false)
  const [relativeOpen, setRelativeOpen] = useState(false)
  const [start, end] = chordDetectionRange

  let rangeString
  if (typeof start === 'number' && typeof end === 'number') {
    rangeString = `${Midi.midiToNoteName(start)} to ${Midi.midiToNoteName(end)}`
  } else if (typeof start === 'number') {
    rangeString = `starting at ${Midi.midiToNoteName(start)}`
  } else if (typeof end === 'number') {
    rangeString = `ending at ${Midi.midiToNoteName(end)}`
  } else {
    rangeString = `not defined`
  }

  return (
    <Fragment>
      <List>
        <ListItem button onClick={() => setShowRangeDialog(true)}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary='Detection note range'
            secondary={rangeString} />
        </ListItem>
        <ListItem button onClick={() => setRelativeOpen(!relativeOpen)}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary='Detection root' />
						<Select
							open={relativeOpen}
              onOpen={() => setRelativeOpen(true)}
              onClose={() => setRelativeOpen(false)}
							value={relativeScale}
							onChange={e => setRelativeScale(e.target.value)}
						>
							<MenuItem value={false}>Absolute</MenuItem>
							{Scale.get('a chromatic').notes.map(n => (
								<MenuItem key={n} value={n}>{n}</MenuItem>
							))}
						</Select>
        </ListItem>
      </List>
      <ChordDetectionRangeDialog
        showRangeDialog={showRangeDialog}
        setShowRangeDialog={setShowRangeDialog}
        setChordDetectionRange={setChordDetectionRange}
        initialValue={chordDetectionRange}
      />
    </Fragment>
  )
}

const ChordDetectionRangeDialog = function (
  {showRangeDialog, setShowRangeDialog,
  setChordDetectionRange, initialValue}) {
  const classes = useStyles()
  const [initialStart, initialEnd] = initialValue
  const [start, setStart] = useState(initialStart ? Midi.midiToNoteName(initialStart) : '')
  const [end, setEnd] = useState(initialEnd ? Midi.midiToNoteName(initialEnd) : '')

  useEffect(() => {
    let newStart, newEnd
    if (start.length) {
      newStart = Midi.toMidi(start)
      if (newStart === null) 
        return
    } else {
      newStart = null
    }
    if (end.length) {
      newEnd = Midi.toMidi(end)
      if (newEnd === null) 
        return
    } else {
      newEnd = null
    }
    setChordDetectionRange([newStart, newEnd])
  }, [start, end,
    // redux
    setChordDetectionRange])

  return (
      <Dialog open={showRangeDialog} 
        onClose={() => setShowRangeDialog(false)}
      >
        <DialogTitle>Note range for chord detection</DialogTitle>
        <DialogContent className={classes.dialogRoot}>
          <TextField
                className={classes.inputRow}
                label="start note"
                placeholder='e.g. A1, blank for none'
                value={start || ''}
                onChange={e => setStart(e.target.value)}
                error={!!(start.length && Midi.toMidi(start) === null)}
                helperText={start.length && Midi.toMidi(start) === null ? "Invalid note name" : ' '}
              />
          <TextField
                className={classes.inputRow}
                label="end note"
                placeholder='e.g. B3, blank for none'
                value={end || ''}
                onChange={e => setEnd(e.target.value)}
                error={!!(end.length && Midi.toMidi(end) === null)}
                helperText={end.length && Midi.toMidi(end) === null ? "Invalid note name" : ' '}
              />
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => {setStart(''); setEnd('')}}>Reset</Button>
          <Button size="small" onClick={() => setShowRangeDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
  )
}

export function BackgroundTask() {
  const [chords, id] = useChords()
  const [, setChordHistory] = useChordHistory()

  useEffect(() => {
    if (!chords.length)
      return
    setChordHistory(chordHistory => {
      let newHistory = [...chordHistory]
      // update
      if (newHistory[newHistory.length - 1] 
        && newHistory[newHistory.length - 1].id === id) {
        newHistory[newHistory.length - 1].chords = chords
        return newHistory
      }
      // shrink
      if (newHistory.length > 10)
        newHistory = newHistory.slice(newHistory.length - 10)
      // add
      return newHistory.concat({chords, id})
    })
  }, [chords, id, setChordHistory])

  return null
}

export { default as config } from './config'
export { default as StatusBar } from './statusBar'
