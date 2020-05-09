
MIDIate
========

MIDIate is a platform of MIDI-based apps, designed to be easily extensible (via React).
### **[Visit midiate.now.sh](https://midiate.now.sh)** to see the latest version.

Features
--------

- Broad MIDI-based platform with intuitive React APIs
- Uses WebMIDI interface to instantly allow connection
- Several built-in apps to get started 

APIs
----------
### Semantics
There are several concepts in MIDIate:
- The **UI** consists of two parts: the **app view** and a **status bar**.
- **Apps** are JS libraries that export React components. 
  Apps get control in three different ways -  as a `BackgroundTask`, in the `StatusBar` or as a full app (`default` export).
  - **System apps** are special apps that have broad effects on the system. 
- **Hooks** are used as the default APIs of MIDIate. They use [React Hooks](https://reactjs.org/docs/hooks-intro.html) in order to provide the relevant arguments.
  All hooks exist under `/src/api`.
  - **useLastEvent**, **useNotes** and **useChords** are examples of (the most popular) hooks.
- **Handlers** are components that stream data from a MIDI source to all the apps.

### Writing an app
As we described, apps are the breathing core of MIDIate. They can access all the events in the system and show processed data to the user in several ways.

Each app has to follow a specific structure:

1. Provide an export to a `config` object (see "app config" below for details and options)
2. Provide an export to `default` (main view), `StatusBar` (cross-app status bar), `BackgroundTask` (invisible background processing unit), or a combination of these. 
 The exported should be valid React elements.

### App hooks
All the hooks are under `/src/api`, separated to logical libraries. 
#### api/events.js
Hooks to receive and send MIDI events. 
Events are the bare elements of MIDIate and are the base for the rest of the musical data.
- `useLastEvent()->{...}`  - returns the last event received from any input (see "events" below for details).
- `useSendEvent()` - returns a function with the signature `sendCustomEvent(deltaTime, msg, appId)` to send ("dispatch") curated MIDI messages from apps. 
#### api/notes.js
Notes are smarter version of events. 
They track _note_on_ and _note_off_ events to provide a coherent list of currently-played notes.
The hooks also provide a convenient heuristic regarding the possible notes the player intended to play (mostly useful for chord-based scenarios).
- `useNotes(config?)->[notes...]` - returns a list of currently-played notes. 
Optional config can be provided with `{data: "simple" | "extended"}` as an argument. While `"simple"` mode only returns the played notes, `"extended"` mode returns the events that triggered those notes.
- `useSmartNotes(config?)->{events,id}` - returns a list of played notes with an associated "detection ID". Written with chord recognition in mind. `config` has same behavior as `useNotes()`.
The return value respects some assumptions:
  -   `events` only change when notes are added or change - not when they are removed (unless all notes are removed)
  - `id` only changes when all notes change
#### api/chords.js
Chords are detected sequences of notes.
They use `useSmartNotes()` and return information about the currently-played chords.
We use [@tonaljs/chord-detect](https://github.com/tonaljs/tonal/tree/master/packages/chord-detect) (with minor alterations) as our detector.
- `useChords(filterFunction?)->[chords,id]` - returns a tuple of possible chord detections (`[chord1, chord2, ...]`) and a detection ID that changes when the player completely lets go of the piano.
  - Optional `filterFunction` receives a list of events and returns note names (`C4`, `Ab6` etc.)
- `useRelativeChords(relativeScale, filterFunction?)->[chords,id]` - returns a tuple similar to `useChords()`, but normalized to roman notation if present (`Em6` is `IIIm6` when `C` is the relative scale).
#### api/settings.js
Convenience wrappers for app configurations and inter-process communication between the app components.

Let's say you want to load a resource in your background task and show this on the status bar. You would possibly configure a _redux store_ in order to send pieces of data between them. Also, you might want to serialize the user-selected resource to `localStorage`, allowing it to survive a page refresh.
This is exactly the functionality the settings APIs provide.
- `useSetting(name, defaultValue)->[value,setValue]` - behaves a lot like `useState()` but automatically serializes the written value to `localStorage`. Allows cross-component settings (for instance, a setting set in the main view can be read using the same `name` in the status bar or the background task). 
- `useSessionValue(name, defaultValue)->[value,setValue]` - similar to `useSetting()` but only stores the data for until the refresh. Useful for volatile states (loading a resource, timed states etc.)
#### api/context.js
Lets apps use their configuration.
- `useAppContext()->{...}` returns a `config` object for the current app.
  Can be used in a `BackgroundTask`, in the `StatusBar` and in the `default` export.
#### api/midi.js
Gives apps access to the raw WebMIDI APIs.
- `useMidiOutputs()->[outputs...]` - returns a list of WebMIDI outputs.

### App configuration
Most apps can just export a simple `config` with a name and an icon.
The full `config` format is:
```js
{
  // app name (required when shows in menu)
  name: "Example App", 
  // custom app icon for app menu (optional)
  icon: <ReactComponent />,
  // should app show in app menu? (optional)
  showInMenu: bool, // = true 
  // override default status bar onClick action (optional, defaults to this app page)
  statusBarAction: string, //. e.g. SETTINGS_APP_ID or DEFAULT_APP_ID (from /src/constants.js) 
}
```
### Events
MIDI events have the following structure:
```js
{
  // time between last message and this message in ms
  deltaTime:  float,
  // frequency of MIDI note
  freq:  float,
  // key of MIDI note [0-127]
  key:  int,
  // parsed message type ("noteon", "noteoff", "programchange", "controlchange", etc.)
  messageType:  string,
  // parsed note name ("C5", "G#3", etc.)
  note:  string,
  // source of midi message
  source:  {
	// source type ("midi", "keyboard", "server", "app")
	type: string,
	// ...extra per-source data (id and name for "midi", host for "server", id for "app"
  },
  // ...extra per-message data (velocity, program, pressure, etc.)

  // raw message data
  _data:  Uint8Array(3) [144,  72,  0]
  // parsed MIDI message code
  _messageCode:  144
}
```
Events are first parsed with [MIDIMessage](https://github.com/notthetup/midimessage) and then enriched with [@tonaljs](https://github.com/tonaljs/tonal) and some custom logic. 

### Basic app example
Here's a quick guide of how to write a simple app using the most common hooks.
In this example we assume the app is located in `/src/apps/<app-name>`.
#### Import APIs and other libraries
```js
import React, { useCallback, useEffect } from 'react'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import { useLastEvent } from '../../api/events'
import { useNotes } from '../../api/notes'
import { useChords } from '../../api/chords'
import { useSessionValue } from '../../api/settings'
```
### Define session values
```js
// it's recommended to put settings in a common place
const useNotesHistory = () => 
  useSessionValue('notesHistory', [])
```
#### Export main view (with more detailed information)
```js
/* show played notes and chords */
export default function () {
  const notes = useNotes()
  const [chords,] = useChords()  // don't need the ID
  const [notesHistory,] = useNotesHistory()  // don't need to set

  return (
    <div>
      <b>chords:</b> 
      <ul>
        {chords.map(chord => <li>{chord}</li>)}
      </ul>
      <b>notes:</b>
      <ul>
        {notes.map(note => <li>{note}</li>)}
      </ul>
      <b>history:</b>
      <ul>
        {notesHistory.map(note => <li>{note}</li>)}
      </ul>
    </div>
  )
}
```
#### Export a background task to collect notes in the background
```js
/* collect notes even when not on main app view */
export function BackgroundTask() {
  const lastEvent = useLastEvent()
  const [notesHistory, setNotesHistory] = useNotesHistory()

  // memoize an adder function
  const addToHistory = useCallback(note => {
    const newHistory = [...notesHistory]
    setNotesHistory(newHistory.concat(note))
  }, [notesHistory, setNotesHistory])

  // add note to history whenever a new note is played
  useEffect(() => {
    // lastEvent is null on the first run
    if (!lastEvent)
      return

    if (lastEvent.messageType === 'noteon')
      addToHistory(lastEvent.note) 
  }, [lastEvent])

  // always render nothing from background tasks
  return null
}
```
#### Export a status bar component with some aggregated data 
```js
/* shows history count on status bar */
export function StatusBar() {
  const [notesHistory,] = useNotesHistory()  // don't need to set

  return notesHistory.length
}
```
#### Lastly, export `config`
```js
// make app accessible with a friendly name
export const config = {
  name: "Notes Viewer",
  icon: <MusicNoteIcon />,
}
```
 
### Apps vs. System apps
The two are actually very similar. The main difference is the logical association (system apps provide cross-app/core functionality, while regular apps let users experience a specific narrative).

The only technical subtlety is that system apps can provide an export to `settings` that automatically show in the settings app - while regular apps need to write their own settings layout.

If you're about to write an app, unless you're trying to expand the core functionality (event collection, output methods, traversal etc.) - you probably want to write a regular app. 

Development
----------
To get started with MIDIate locally, just follow these three steps: 
1. clone the repository (and `cd` into the directory)
2. run `yarn`
3. run `yarn start`. 

Browse `http://localhost:3000` in order to see in in development mode, or run `yarn build` in order to compile.

MIDIate is based on `create-react-app`.

Frequently Asked
---------
- **Can I use MIDIate as an external package?**
It's currently not possible to easily use MIDIate APIs as a library/npm package, but future versions may support a `@midiate/api` import that makes it easier.
- **Is it possible to connect to MIDIate remotely?**
 The package currently supports WebSockets as an external MIDI source. It means it's easy mostly within the LAN. 
Check out [midiate-utils](https://github.com/thebne/midiate-utils) for compatible streaming servers (depending on your operating system, they may require system libraries).
