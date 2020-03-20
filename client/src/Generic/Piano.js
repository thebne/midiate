import React from 'react'
import { Note } from "@tonaljs/tonal"

import './Piano.css'

export default function Piano(props) {
	// aggregate notes, currently ignore different octaves (TODO support full piano)
	let colors = {}
	for (const n in props.colors) {
		colors[Note.pitchClass(n)] = props.colors[n]
	}
	const notes = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"].map((n) => {
		const type = /#$/.test(n) ? "black" : "white"
		// TODO this assumes that we'll always get flat accidentals, handle better (find a better way to compare n and colors.keys())
		const color = colors[Note.enharmonic(n)]
		console.log(n, type, color)
		return <li key={n} className={[n.replace("s", "#"), type].join(' ')} style={{background: color}} />
	})
	
	return <ul className="piano">
		{notes}
</ul>
}
