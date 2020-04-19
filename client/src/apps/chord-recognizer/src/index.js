import React, { useLayoutEffect, useState } from 'react'
import { Animate } from 'react-move'
import { interpolate, interpolateTransformSvg } from 'd3-interpolate'
import { easeSinOut } from 'd3-ease'
import styles from './style.module.css'

const ColorHash = require('color-hash')
const colorHash = new ColorHash({lightness: .5})

export default function ChordRecognizer({chords}) {
  const [animations, setAnimations] = useState([])

  // add or remove animation objects
  useLayoutEffect(() => {
    setAnimations(entries => {
      entries = [...entries]
      let prev = entries[entries.length - 1]

      // check if there's an existing detection. if so, remove it
      if (prev && prev.active && chords.id !== prev.id) {
        prev.active = false
        setTimeout(() => setAnimations((entries) => {
          entries = [...entries]
          entries.splice(entries.indexOf(prev), 1)
          return entries 
        }), 4000)
      }
      // add new detections
      if ((!prev || prev.id !== chords.id) && chords.detection.length) {
        entries.push({...chords, time: new Date().getTime(), active: true})
      }
      // update existing detection
      else if (prev && prev.id === chords.id && chords.detection.length) {
        prev.detection = chords.detection
	  }
	  
      return entries
    })
  }, [chords])

	return (
		<svg 
			viewBox="0 0 100 100" 
			style={{
        position: 'absolute',
        top: 0,
        left: 0,
				width: '100%',
				height: '100%',
				}} >
			{animations.map((animation) => <Animate
				key={animation.id}
				show={animation.active}
				start={{
          sizeFactor: .5,
					g: {
						transform: 'translate(50, 100)',
						opacity: 0,
					},
				}}
				enter={{
          sizeFactor: [1],
					g: {
						transform: 'translate(50, 60)',
						opacity: [1],
					},
					timing: { duration: 200, ease: easeSinOut },
				}}
				update={{
          sizeFactor: [1],
					g: {
						opacity: 1,
						transform: 'translate(50, 60)',
					},
					timing: { duration: 80, ease: easeSinOut },
				}}
				leave={{
          sizeFactor: [.6],
					g: {
						opacity: [1],
						transform: ['translate(50, -20)'],
					},
					timing: { duration: 4000, ease: easeSinOut },
				}}
				interpolation={(begValue, endValue, attr) => {
					if (attr === 'transform') {
						return interpolateTransformSvg(begValue, endValue)
					}
					return interpolate(begValue, endValue)
				}}
			>
				{({circle, g, sizeFactor}) => {
					const [main, ...rest] = animation.detection
					return (
						<g {...g}
							className={styles.chordDetection}>
							<ellipse rx={20 * sizeFactor} ry={10 * sizeFactor}
                fill={colorHash.hex(main)} {...circle} />
							<text 
							fill="white" 
							fontSize={6 * sizeFactor}
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
								fontSize={3 * sizeFactor}
								y={2 * sizeFactor * (i + 1)}
								style = {{
									dominantBaseline: "hanging",
									textAnchor: "middle",
								}} >
									{secondary.length === main.length ? secondary : ''}
							</text>)
							)}
					</g>)
				}}
		</Animate>)}
	</svg>
	)
}
  
// midiate support
export { default as config } from './midiate/config'
export { default as StatusBar } from './midiate/statusBar'
export { default as createSelectors } from './midiate/selectors'
