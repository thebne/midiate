
MIDIate
========

MIDIate is a platform designed for the quick and easy development of MIDI-based React applications.

### **[Visit midiate.now.sh](https://midiate.now.sh)** to see the latest version.

Features
--------
- Provides a framwork with intuitive MIDI-based React APIs (e.g. `getNotes()`)
- Uses WebMIDI interface to instantly allow MIDI-device connections
- Supports use of computer keyboard as a MIDI device
- Includes several built-in apps to get started

APIs
----------
### Quickstart - Simple Note Viewer
To demonstrate just how easy and fast it is to write an app on top of MIDIate, let's build together a very basic app that:
- visualizes notes and chords played in realtime
- adds the number of notes played on the status bar

This example uses the most common API hooks. For more detailed documentation, be sure to continue reading beyond this section.

#### Development Set-Up

To get started with MIDIate locally: 
1. clone the repository (and `cd` into the directory)
2. run `yarn`
3. run `yarn start`
4. Go to `http://localhost:3000`

Note - MIDIate is based on `create-react-app`

#### Create a new app
`/src/apps/<note-viewer>.js`

#### Import APIs and other libraries
```js
import React, { useEffect } from 'react'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import { useLastEvent } from '../api/events'
import { useNotes } from '../api/notes'
import { useChords } from '../api/chords'
import { useSessionValue } from '../api/settings'
```
#### Define session values
```js
// it's recommended to put settings in a common place
const useNotesHistory = () => 
  useSessionValue('notesHistory', [])
```
Defining this hook in one place will ensure that when our app loads `notesHistory` it will load with the correct default value and will not be in conflict other uses of `notesHistory` in our note-viewer app.

For more explaination, see documentation on `api/settings.js`.

#### Export main view
```js
/* show played notes and chords */
export default function () {
  const notes = useNotes()
  const [chords,] = useChords()
  const [notesHistory,] = useNotesHistory()

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
Note that we use `useNotesHistory` similarly to how we would use the `useState()` React hook.

#### Export a background task to collect notes in the background
```js
/* collect notes even when not on main app view */
export function BackgroundTask() {
  const lastEvent = useLastEvent()
  const [, setNotesHistory] = useNotesHistory()

  // add note to history whenever a new note is played
  useEffect(() => {
    // lastEvent is null on the first run
    if (!lastEvent)
      return

    if (lastEvent.messageType === 'noteon') { 
      setNotesHistory(notesHistory => {
        const newHistory = [...notesHistory]
        return newHistory.concat(lastEvent.note)
      })
    }
  }, [lastEvent, setNotesHistory])

  // always render nothing from background tasks
  return null
}
```

This will allow our app to collect note history even when not on the main app view.

#### Export a status bar component with some aggregated data 
```js
/* shows history count on status bar */
export function StatusBar() {
  const [notesHistory,] = useNotesHistory()  // don't need to set

  return notesHistory.length
}
```
This allows us to add our own data in the status bar- a component which is always visible.

#### Export `config`
```js
// make app accessible with a friendly name
export const config = {
  id: "NOTES_VIEWER",
  name: "Notes Viewer",
  icon: MusicNoteIcon,
}
```
Here, we define our app's configurations, including a name and icon that will be featured on the main page.

#### Lastly, add the new app to the list of exported apps in `src/config/apps.js`

```js
  require('../apps/chord-recognizer'),
  require('../apps/piano-simulator'),
  require('../apps/heatmap'),
  require('../apps/web-player'),
  require('../apps/recorder'),
  require('../apps/song-matcher'),
  require('../apps/note-viewer') // our app
]
```

#### What did we just build?
We've just build a react app that:
- Appears on the main page, with an icon and name, that links to its main view.
- Displays the currently played chord or note, and a history of all notes played on it's main view.
- Displays a count of notes played on the status bar.

Our note-viewer thus has it's own **app view** AND controls a piece of the **status-bar**.

### Semantics
There are several key concepts in MIDIate:
- The **UI** consists of two parts: the **app view** and a **status bar**.
- The **status bar** is exactly what it sounds like - a header that is always visible and displays summary data. Individual apps can add components to the status bar.
- **Apps** (in `src/apps`) are JS libraries that export React components. 
  An app manifests itself in three different ways -  as a `BackgroundTask`, in the `StatusBar` or as a main view (`default` export), which takes up the full screen. 
  For example, our note-viewer app is all three- it has a `BackgroundTask` that sets `notesHistory`, renders a component on the `StatusBar` that displays a count of played notes, and has a full app view itself, which is accessible from the main MIDIate page.
  - **System apps**  (in `src/apps/system`)are special apps that provide core functionality to or have broad effects on the system (e.g. `midi-input`)
- **Hooks** are used as the default APIs of MIDIate. They use [React Hooks](https://reactjs.org/docs/hooks-intro.html) in order to provide the relevant arguments.
  All hooks exist under `/src/api`.
  For example,  **useLastEvent**, **useNotes** and **useChords** are commonly used hooks.

### Writing an app
As we described, apps are the breathing core of MIDIate. They can access all the events in the system and show processed data to the user in several ways.

Each app has to follow a specific structure:

1. Provide an export to a `config` object (see "app config" below for details and options)
2. Provide an export to `default` (main view), `StatusBar` (cross-app status bar), `BackgroundTask` (invisible background processing unit), or a combination of these. 
 All exported items should be valid React elements.

### App hooks
All the hooks are under `/src/api`, separated to logical libraries. 
#### api/events.js
Receive and send MIDI events.

Events are the bare elements of MIDIate and are the base for the rest of the musical data.

- `useLastEvent()->{...}`  - returns the last MIDI event received from any input (see "events" below for details).
- `useSendEvent()` - returns a function with the signature `sendEvent(msg)` to send curated MIDI messages from apps. 
#### api/notes.js
Notes are a "smarter" version of events. 

They track _note_on_ and _note_off_ events to provide a coherent list of currently-played notes.
The hooks also provide a convenient heuristic regarding the possible notes the player intended to play (mostly useful for chord-based scenarios).
- `useNotes(config?)->[notes...]` - returns a list of currently-played notes. 

  Optional config can be provided with `{data: "simple" | "extended"}` as an argument. While `"simple"` mode only returns the played notes, `"extended"` mode returns the events that triggered those notes.
- `useSmartNotes(config?)->{events,id}` - returns a list of played notes with an associated "detection ID". Written with chord recognition in mind. `config` has same behavior as `useNotes()`.

  The return value respects some assumptions:
  - `events` only change when notes are added or changed - not when they are removed (unless all notes are removed)
  - `id` only changes when all notes change
#### api/chords.js
Chords are detections of a sequences of notes.

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

- `useConfig()->{...}` returns a `config` object for the current app.

  Can be used in a `BackgroundTask`, in the `StatusBar` and in the `default` export.
#### api/midi.js
Gives apps access to the raw WebMIDI APIs.

- `useMidiOutputs()->[outputs...]` - returns a list of WebMIDI outputs.

### App configuration
Most apps can just export a simple `config` with a name and an icon.
The full `config` format is:
```js
{
  // app id (required and should be unique)
  id: "EXAMPLE",
  // app name (required when shows in menu)
  name: "Example App", 
  // custom app icon for app menu (optional)
  icon: ReactComponent,
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
  _data:  Uint8Array(3),
  // parsed MIDI message code [0-255]
  _messageCode:  int,
}
```
Events are first parsed with [MIDIMessage](https://github.com/notthetup/midimessage) and then enriched with [@tonaljs](https://github.com/tonaljs/tonal) and some custom logic. 
 
### Apps vs. System apps
System apps provide cross-app/core functionality, while regular apps let users experience a specific experience.

#### Logical Difference
For example, the `midi-input` system app is what allows all MIDI apps to have access to midi events, either from the keyboard, a MIDI device, or the web. The regular app `chord-recognizer`, on the other hand, builds upon this core functionality by showing an nice visualization of the current chord being played.

#### Technical Difference
System apps can provide an export to `settings` that automatically show in the settings app, while regular apps need to write their own settings layout.

#### Is my app a system app or regular app?
Unless you're trying to expand the core functionality (event collection, output methods, traversal etc.) - you're probably writing a regular app. 

Frequently Asked
---------
- **Can I use MIDIate as an external package?**

  It's currently not possible to easily use MIDIate APIs as a library/npm package, but future versions may support a `@midiate/api` import that makes it easier.
- **Is it possible to connect to MIDIate remotely?**

  The package currently supports WebSockets as an external MIDI source. It means it's easy mostly within the LAN. 
 
  Check out [midiate-utils](https://github.com/thebne/midiate-utils) for compatible streaming servers (depending on your operating system, they may require system libraries).

- **Can I use MIDIate without owning a MIDI device?**

  Yes! Your computer keyboard can serve as a midi-device, though the functionality is currently limited.
