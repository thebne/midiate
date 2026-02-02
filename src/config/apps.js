import * as defaultApp from '../apps/default'
import * as chordRecognizer from '../apps/chord-recognizer'
import * as pianoSimulator from '../apps/piano-simulator'
import * as heatmap from '../apps/heatmap'
import * as webPlayer from '../apps/web-player'
import * as recorder from '../apps/recorder'
import * as appearance from '../apps/appearance'
import * as io from '../apps/io'

export default [
  // default app - shows menu of all apps
  defaultApp,

  // functional apps
  chordRecognizer,
  pianoSimulator,
  heatmap,
  webPlayer,
  recorder,
  //songMatcher,

  // appearance (theme selection, etc.)
  appearance,
  // IO app - receives and sends MIDI events
  io,
]
