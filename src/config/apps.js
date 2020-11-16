export default [
  // default app - shows menu of all apps
  require('../apps/default'),

  // functional apps
  require('../apps/chord-recognizer'),
  require('../apps/piano-simulator'),
  require('../apps/heatmap'),
  require('../apps/web-player'),
  require('../apps/recorder'),
  //require('../apps/song-matcher'),

  // appearance (theme selection, etc.)
  require('../apps/appearance'),
  // IO app - receives and sends MIDI events
  require('../apps/io'),
]
