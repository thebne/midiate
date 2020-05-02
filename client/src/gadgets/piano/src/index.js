import React from 'react'
import { Note, Scale, Midi } from "@tonaljs/tonal"
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  pianoContainer: {
    display: "flex",
    justifyContent: "center",
  },
  
  pianoBody: {
    display: "inline-block",
    border: "1px solid #160801",
    borderRadius: "1vw",
    background: "linear-gradient(to bottom right,rgba(80,40,0,1),rgba(45,15,0,1))",
    boxShadow: "0 0 50px rgba(0,0,0,0.5) inset,0 1px rgba(212,152,125,0.2) inset,0 5px 15px rgba(0,0,0,0.5)",
    position: "relative",
  },
  
  notesList: {
    display: "flex",
    height: "9.5vw",
    maxWidth: "98vw",
    padding: "0 1vw 1vw 1vw",
    marginBlockStart: 0,
  },
  
  noteRender: {
    height: "10vw",
    width: "1.5vw",
    zIndex: 1,
    borderLeft: "1px solid #bbb",
    borderBottom: "1px solid #bbb",
    borderRadius: "0 0 5px 5px",
    boxShadow: "-1px 0 0 rgba(255,255,255,0.8) inset,0 0 5px #ccc inset,0 0 3px rgba(0,0,0,0.2)",
    background: "linear-gradient(to bottom,#eee 0%,#fff 100%)",

    '$white:active &, $white.pressed &': {
      borderTop: "1px solid #777",
      borderLeft: "1px solid #999",
      borderBottom: "1px solid #999",
      boxShadow: "2px 0 3px rgba(0,0,0,0.1) inset,-5px 5px 20px rgba(0,0,0,0.2) inset,0 0 3px rgba(0,0,0,0.2)",
      background: "linear-gradient(to bottom,#fff 0%,#e9e9e9 100%)",
    },
    
    '$black &': {
      position: 'relative',
      height: '6vw',
      width: '.8vw',
      zIndex: 2,
      border: '1px solid #000',
      borderRadius: '0 0 3px 3px',
      boxShadow: '-1px -1px 2px rgba(255,255,255,0.2) inset,0 -5px 2px 3px rgba(0,0,0,0.6) inset,0 2px 4px rgba(0,0,0,0.5)',
      background: 'linear-gradient(45deg,#222 0%,#555 100%)',
    },
    '$black:active &, $black.pressed &': {
      boxShadow: '-1px -1px 2px rgba(255,255,255,0.2) inset,0 -2px 2px 3px rgba(0,0,0,0.6) inset,0 1px 2px rgba(0,0,0,0.5)',
      background: 'linear-gradient(to right,#444 0%,#222 100%)',
    }
  },
  
  noteBody: {},
  black: {
    '& $noteBody': {
      position: "absolute",
      left: "-.4vw",
    },
  },
  white: {},
  
  noteItem: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    position: "relative",
    float: "left",

    '&:first-child': {
      borderRadius: '5px 0 5px 5px',
    },
    '&:last-child': {
      borderRadius: '0 5px 5px 5px',
    },
  },
}))

const MIDI_START_NOTE = 0
const MIDI_END_NOTE = 127

// if singleOctave is a note name, create only a single octave starting from this name
export default function Piano({classNames={}, styles={}, singleOctave, startNote, endNote,
  NoteEffectComponent, NoteEffectProps={}, overrideClasses={}}) {
  const classes = useStyles()
  const getClass = name => `${classes[name] || ''} ${overrideClasses[name] || ''}`
  let notes

  if (singleOctave) {
    // aggregate notes, ignore different octaves (use 1 as the octave)
    for (const [note, cls] in Object.entries(classNames)) {
      classNames[`${Note.pitchClass(note)}1`] = cls
    }
    // create a chromatic scale (including blacks and whites) from root
    notes = Scale.get(`${singleOctave}1 chromatic`).notes
  } else {
    // convert textual note (e.g. Ab4) to midi numbers, check range and return to text
    const startMidi = Midi.toMidi(startNote) || MIDI_START_NOTE
    const endMidi = Midi.toMidi(endNote) || MIDI_END_NOTE
    if (startMidi > endMidi)
      throw new Error(`start > end: ${startNote} > ${endNote}`)
    if (endMidi > MIDI_END_NOTE || startMidi < MIDI_START_NOTE)
      throw new Error(`start or end out of bounds: `
        `${startNote} < ${MIDI_START_NOTE} ||  ${endNote} > ${MIDI_END_NOTE}`)

    // translate range back from midi numbers to textual notes
    notes = [...Array(endMidi - startMidi + 1).keys()].map(m => Note.fromMidi(startMidi + m))
  }
	
	return (
    <div className={getClass('root')}>
      <div className={getClass('pianoContainer')}>
        <div className={getClass('pianoBody')}>
          <ul className={getClass('notesList')}>
            {notes.map(n => 			
              <PianoKey 
                key={n} 
                note={n} 
                className={classNames[n]} 
                style={styles[n]}
                getClass={getClass}
                NoteEffectComponent={NoteEffectComponent}
                NoteEffectProps={NoteEffectProps[n]}
              >
                }
              </PianoKey>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

const PianoKey = React.memo(({note, className, style, getClass, 
  NoteEffectComponent, NoteEffectProps}) => { 
  const type = Note.accidentals(Note.simplify(note)).length ? "black" : "white"

  return (
    <li className={[
      // generic styling
      getClass('noteItem'), 
      // className from props.classNames[note]
      className, 
      // black / white
      getClass(type), 
      ].join(' ')}
    >
      <div className={getClass('noteBody')}>
        <div className={getClass('noteRender')} style={style} />
          {NoteEffectComponent && 
            <NoteEffectComponent 
              note={note}
              {...(NoteEffectProps || {})}
            />
          }
      </div>
    </li>
  )
}, (prevProps, nextProps) => {
  // only compare visuals that might change
  return prevProps.className === nextProps.className
    && JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
    && JSON.stringify(prevProps.NoteEffectProps) === JSON.stringify(nextProps.NoteEffectProps)
})
