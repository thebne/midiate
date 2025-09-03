MIDIate
=======

MIDIate is a lightweight utility library that exposes React hooks for working with MIDI input.

## Usage

Wrap your application with the `MidiProvider` and use the provided hooks:

```jsx
import { MidiProvider, useNotes, useChords } from '@midiate/midiate'

function App() {
  return (
    <MidiProvider>
      <Viewer />
    </MidiProvider>
  )
}

function Viewer() {
  const notes = useNotes()
  const [chords] = useChords()
  return (
    <div>
      <div>Notes: {notes.join(', ')}</div>
      <div>Chords: {chords.join(', ')}</div>
    </div>
  )
}
```

The provider automatically connects to available Web MIDI inputs. You can also send
custom events using the `useSendEvent` hook.

## API

- `MidiProvider` – context provider that listens to MIDI messages.
- `useLastEvent()` – returns the last parsed MIDI event.
- `useSendEvent()` – dispatch a custom MIDI event.
- `useNotes({ data = 'simple' })` – list of currently pressed notes or raw events.
- `useSmartNotes({ data = 'simple' })` – note events with detection id.
- `useChords(filterFn)` – `[chords, id]` for detected chords.
- `useRelativeChords(relative, filterFn)` – chords normalised to a relative scale.

## License

Apache-2.0
