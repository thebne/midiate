import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import { Note, Chord } from '@tonaljs/tonal'
import { useNotes } from '../../api/notes'
import { detect } from '../../api/chords'

const ENEMY_SPEED = 0.6
const LASER_DURATION = 200
const PARTICLE_COUNT = 12
const COMBO_TIMEOUT = 1500

// Game modes
const MODES = {
  notes: {
    name: 'Notes',
    description: 'Single notes',
    spawnInterval: 2200,
  },
  triads: {
    name: 'Triads',
    description: '3-note chords',
    spawnInterval: 3500,
  },
  complex: {
    name: 'Complex',
    description: '7th chords & more',
    spawnInterval: 4500,
  },
}

// Chord definitions for each mode
const TRIAD_CHORDS = ['C', 'Cm', 'D', 'Dm', 'E', 'Em', 'F', 'Fm', 'G', 'Gm', 'A', 'Am', 'B', 'Bm']
const COMPLEX_CHORDS = ['Cmaj7', 'Cm7', 'C7', 'Dm7', 'D7', 'Em7', 'E7', 'Fmaj7', 'Fm7', 'G7', 'Am7', 'A7', 'Bm7b5']

const useStyles = makeStyles(theme => ({
  '@global': {
    '@keyframes float': {
      '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
      '50%': { transform: 'translateY(-8px) rotate(3deg)' },
    },
    '@keyframes pulse': {
      '0%, 100%': { transform: 'scale(1)', opacity: 1 },
      '50%': { transform: 'scale(1.1)', opacity: 0.8 },
    },
    '@keyframes shimmer': {
      '0%': { backgroundPosition: '-200% center' },
      '100%': { backgroundPosition: '200% center' },
    },
    '@keyframes particleExplode': {
      '0%': { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      '100%': { transform: 'translate(var(--tx), var(--ty)) scale(0)', opacity: 0 },
    },
    '@keyframes laserFire': {
      '0%': { opacity: 0, transform: 'scaleY(0)' },
      '20%': { opacity: 1, transform: 'scaleY(1)' },
      '100%': { opacity: 0 },
    },
    '@keyframes screenShake': {
      '0%, 100%': { transform: 'translate(0, 0)' },
      '25%': { transform: 'translate(-5px, 5px)' },
      '50%': { transform: 'translate(5px, -5px)' },
      '75%': { transform: 'translate(-5px, -5px)' },
    },
    '@keyframes starTwinkle': {
      '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
      '50%': { opacity: 1, transform: 'scale(1.2)' },
    },
    '@keyframes nebulaPulse': {
      '0%, 100%': { opacity: 0.3 },
      '50%': { opacity: 0.5 },
    },
    '@keyframes comboPopIn': {
      '0%': { transform: 'scale(0) rotate(-10deg)', opacity: 0 },
      '50%': { transform: 'scale(1.2) rotate(5deg)' },
      '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
    },
    '@keyframes floatUp': {
      '0%': { transform: 'translateY(0)', opacity: 1 },
      '100%': { transform: 'translateY(-50px)', opacity: 0 },
    },
    '@keyframes warpIn': {
      '0%': { transform: 'scale(0) rotate(180deg)', opacity: 0 },
      '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
    },
    '@keyframes engineFlicker': {
      '0%, 100%': { opacity: 0.8, height: '25px' },
      '50%': { opacity: 1, height: '35px' },
    },
  },

  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 30%, #16213e 70%, #0f3460 100%)',
    overflow: 'hidden',
    fontFamily: '"Orbitron", "Roboto", sans-serif',
  },

  shaking: {
    animation: 'screenShake 0.15s ease-in-out',
  },

  // Nebula background
  nebula: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: `
      radial-gradient(ellipse at 20% 20%, rgba(88, 28, 135, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(15, 52, 96, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(239, 68, 68, 0.05) 0%, transparent 70%)
    `,
    animation: 'nebulaPulse 8s ease-in-out infinite',
  },

  // Stars
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    background: '#fff',
    borderRadius: '50%',
  },
  starTwinkle: {
    animation: 'starTwinkle 3s ease-in-out infinite',
  },

  // Shooting stars
  shootingStar: {
    position: 'absolute',
    width: '100px',
    height: '2px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
    opacity: 0,
    animation: 'shootingStarAnim 3s ease-in-out infinite',
  },

  // Grid lines (subtle)
  gridOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
  },

  // HUD
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '20px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 100,
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
  },
  scorePanel: {
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
    padding: '15px 30px',
    borderRadius: 12,
    border: '1px solid rgba(56, 189, 248, 0.3)',
    boxShadow: '0 0 30px rgba(56, 189, 248, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
  },
  scoreLabel: {
    color: 'rgba(148, 163, 184, 0.8)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 4,
  },
  scoreValue: {
    color: '#38bdf8',
    fontSize: 36,
    fontWeight: 700,
    textShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  comboPanel: {
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
    padding: '12px 25px',
    borderRadius: 12,
    border: '1px solid rgba(167, 139, 250, 0.5)',
    boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
    animation: 'comboPopIn 0.3s ease-out',
  },
  comboText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 700,
    textShadow: '0 0 10px rgba(255,255,255,0.5)',
  },

  // Player
  playerContainer: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
  },
  player: {
    position: 'relative',
    width: 80,
    height: 60,
    filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.5))',
  },
  playerBody: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '40px solid transparent',
    borderRight: '40px solid transparent',
    borderBottom: '55px solid #1e3a5f',
    filter: 'drop-shadow(0 0 5px rgba(56, 189, 248, 0.3))',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 15,
      left: -25,
      width: 0,
      height: 0,
      borderLeft: '25px solid transparent',
      borderRight: '25px solid transparent',
      borderBottom: '40px solid #2563eb',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 25,
      left: -15,
      width: 0,
      height: 0,
      borderLeft: '15px solid transparent',
      borderRight: '15px solid transparent',
      borderBottom: '25px solid #38bdf8',
    },
  },
  playerCannon: {
    position: 'absolute',
    bottom: 50,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 8,
    height: 30,
    background: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
    borderRadius: '4px 4px 0 0',
    boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -5,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 12,
      height: 8,
      background: '#38bdf8',
      borderRadius: '3px 3px 0 0',
    },
  },
  playerEngine: {
    position: 'absolute',
    bottom: -25,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 20,
    height: 25,
    background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 30%, #f97316 60%, #ef4444 100%)',
    borderRadius: '0 0 50% 50%',
    filter: 'blur(3px)',
    animation: 'engineFlicker 0.1s ease-in-out infinite',
    boxShadow: '0 10px 30px rgba(249, 115, 22, 0.5)',
  },
  playerWings: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 100,
    height: 20,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      width: 30,
      height: 8,
      background: 'linear-gradient(90deg, #1e3a5f 0%, #2563eb 100%)',
      top: 0,
    },
    '&::before': {
      left: -15,
      transform: 'skewY(-10deg)',
      borderRadius: '5px 0 0 5px',
    },
    '&::after': {
      right: -15,
      transform: 'skewY(10deg)',
      borderRadius: '0 5px 5px 0',
      background: 'linear-gradient(90deg, #2563eb 0%, #1e3a5f 100%)',
    },
  },

  // Enemy
  enemy: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 40,
    animation: 'warpIn 0.5s ease-out, float 2s ease-in-out infinite',
    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
  },
  enemyGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 80,
    height: 80,
    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  chicken: {
    fontSize: 55,
    position: 'relative',
    zIndex: 1,
    textShadow: '0 5px 15px rgba(0,0,0,0.3)',
  },
  noteLabel: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#1a1a2e',
    padding: '6px 16px',
    borderRadius: 25,
    fontWeight: 800,
    fontSize: 18,
    marginTop: 5,
    boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
    border: '2px solid rgba(255,255,255,0.2)',
    letterSpacing: 1,
  },

  // Laser
  laser: {
    position: 'absolute',
    width: 8,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, #fbbf24 20%, #ef4444 100%)',
    borderRadius: 4,
    zIndex: 45,
    pointerEvents: 'none',
    animation: 'laserFire 0.2s ease-out forwards',
    boxShadow: `
      0 0 10px #fbbf24,
      0 0 20px #fbbf24,
      0 0 30px #ef4444,
      0 0 40px #ef4444
    `,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 20,
      height: 20,
      background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
      borderRadius: '50%',
    },
  },

  // Particles
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
    animation: 'particleExplode 0.6s ease-out forwards',
  },

  // Score popup
  scorePopup: {
    position: 'absolute',
    color: '#fbbf24',
    fontSize: 28,
    fontWeight: 800,
    textShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
    pointerEvents: 'none',
    animation: 'floatUp 0.8s ease-out forwards',
    zIndex: 100,
  },

  // Overlays
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
    zIndex: 200,
    backdropFilter: 'blur(8px)',
  },

  // Start screen
  titleContainer: {
    textAlign: 'center',
    marginBottom: 40,
  },
  titleMain: {
    fontSize: '5rem',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ef4444 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: 'none',
    filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.5))',
    marginBottom: 10,
    letterSpacing: -2,
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.5rem',
    },
  },
  titleIcon: {
    fontSize: '4rem',
    margin: '0 15px',
    filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))',
  },
  titleSub: {
    fontSize: '1.4rem',
    color: '#94a3b8',
    letterSpacing: 8,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  instructions: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 2.2,
    fontSize: '1.1rem',
    maxWidth: 500,
    '& strong': {
      color: '#fbbf24',
      fontWeight: 600,
    },
  },
  instructionIcon: {
    display: 'inline-block',
    margin: '0 8px',
    fontSize: '1.3rem',
  },
  startButton: {
    fontSize: '1.4rem',
    padding: '18px 60px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontWeight: 700,
    borderRadius: 50,
    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: 2,
    textTransform: 'uppercase',
    '&:hover': {
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: '0 15px 50px rgba(16, 185, 129, 0.5)',
      background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    },
  },

  // Game over
  gameOverTitle: {
    fontSize: '5rem',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.5))',
    marginBottom: 20,
    animation: 'pulse 2s ease-in-out infinite',
    [theme.breakpoints.down('sm')]: {
      fontSize: '3rem',
    },
  },
  statsContainer: {
    display: 'flex',
    gap: 40,
    marginBottom: 50,
  },
  statBox: {
    background: 'rgba(30, 41, 59, 0.8)',
    padding: '20px 40px',
    borderRadius: 16,
    border: '1px solid rgba(148, 163, 184, 0.2)',
    textAlign: 'center',
  },
  statLabel: {
    color: 'rgba(148, 163, 184, 0.8)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 48,
    fontWeight: 800,
    fontFamily: 'monospace',
  },
  statValueScore: {
    color: '#fbbf24',
    textShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
  },
  statValueCombo: {
    color: '#a78bfa',
    textShadow: '0 0 20px rgba(167, 139, 250, 0.5)',
  },
  playAgainButton: {
    fontSize: '1.2rem',
    padding: '15px 50px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    fontWeight: 700,
    borderRadius: 50,
    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: 2,
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 15px 50px rgba(59, 130, 246, 0.5)',
    },
  },

  noteHint: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 13,
    textAlign: 'center',
    pointerEvents: 'none',
    letterSpacing: 1,
  },

  // Mode selector
  modeSelector: {
    marginBottom: 40,
  },
  modeButton: {
    padding: '12px 30px',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.7)',
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(59, 130, 246, 0.3)',
      borderColor: 'rgba(59, 130, 246, 0.5)',
    },
  },
  modeButtonActive: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    borderColor: '#3b82f6',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
    '&:hover': {
      background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      borderColor: '#60a5fa',
    },
  },
  modeDescription: {
    color: 'rgba(148, 163, 184, 0.8)',
    fontSize: 14,
    marginTop: 10,
    letterSpacing: 1,
  },

  // Current mode indicator in HUD
  modeIndicator: {
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
    padding: '8px 20px',
    borderRadius: 8,
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },
  modeIndicatorText: {
    color: 'rgba(148, 163, 184, 0.9)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Chord label (wider than note label)
  chordLabel: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: 25,
    fontWeight: 800,
    fontSize: 16,
    marginTop: 5,
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
    border: '2px solid rgba(255,255,255,0.2)',
    letterSpacing: 0,
    whiteSpace: 'nowrap',
  },
}))

// Available notes (C3 to C5)
const AVAILABLE_NOTES = []
for (let midi = 48; midi <= 72; midi++) {
  AVAILABLE_NOTES.push(Note.fromMidi(midi))
}

const getRandomNote = () => AVAILABLE_NOTES[Math.floor(Math.random() * AVAILABLE_NOTES.length)]
const getRandomTriad = () => TRIAD_CHORDS[Math.floor(Math.random() * TRIAD_CHORDS.length)]
const getRandomComplexChord = () => COMPLEX_CHORDS[Math.floor(Math.random() * COMPLEX_CHORDS.length)]

// Format note: uppercase letter, lowercase flat (e.g., "Bb" not "BB")
const formatNote = (note) => {
  const pitch = Note.pitchClass(note)
  if (pitch.length === 1) return pitch.toUpperCase()
  return pitch[0].toUpperCase() + pitch.slice(1).toLowerCase()
}

// Format chord name for display
const formatChord = (chord) => {
  // Replace 'M' with 'maj' for clarity, handle flats
  return chord
    .replace(/^([A-G])b/, (_, letter) => letter + 'b')
    .replace(/^([A-G])#/, (_, letter) => letter + '#')
}

// Normalize chord name for comparison
const normalizeChord = (chord) => {
  return chord
    .replace('maj7', 'M7')
    .replace('Maj7', 'M7')
    .replace('major', '')
    .replace('Major', '')
    .replace('minor', 'm')
    .replace('min', 'm')
    .replace('M', '') // Remove M for major (Chord.detect returns CM for C major)
    .trim()
}

// Check if two chords match (handles inversions and enharmonic equivalents)
const chordsMatch = (detected, target) => {
  const normDetected = normalizeChord(detected).toLowerCase()
  const normTarget = normalizeChord(target).toLowerCase()

  // Direct match
  if (normDetected === normTarget) return true

  // Check without bass note (for inversions like C/E)
  const detectedRoot = normDetected.split('/')[0]
  const targetRoot = normTarget.split('/')[0]
  if (detectedRoot === targetRoot) return true

  // Handle enharmonic equivalents (Db = C#, etc.)
  const enharmonics = {
    'db': 'c#', 'c#': 'db',
    'eb': 'd#', 'd#': 'eb',
    'gb': 'f#', 'f#': 'gb',
    'ab': 'g#', 'g#': 'ab',
    'bb': 'a#', 'a#': 'bb',
  }

  // Try enharmonic match
  for (const [from, to] of Object.entries(enharmonics)) {
    if (detectedRoot.startsWith(from) && targetRoot.startsWith(to)) {
      const detectedSuffix = detectedRoot.slice(from.length)
      const targetSuffix = targetRoot.slice(to.length)
      if (detectedSuffix === targetSuffix) return true
    }
  }

  return false
}

const getParticleColors = () => ['#fbbf24', '#f59e0b', '#ef4444', '#ffffff', '#fb923c']

export default function ChickenInvaders() {
  const classes = useStyles()
  const notes = useNotes()
  const [gameState, setGameState] = useState('start')
  const [gameMode, setGameMode] = useState('notes')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [enemies, setEnemies] = useState([])
  const [lasers, setLasers] = useState([])
  const [particles, setParticles] = useState([])
  const [scorePopups, setScorePopups] = useState([])
  const [isShaking, setIsShaking] = useState(false)
  const containerRef = useRef(null)
  const gameLoopRef = useRef(null)
  const spawnIntervalRef = useRef(null)
  const comboTimeoutRef = useRef(null)
  const lastNotesRef = useRef([])
  const lastChordsRef = useRef([])
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Detect chords from currently pressed notes
  const detectedChords = useMemo(() => {
    if (gameMode === 'notes' || notes.length === 0) return []
    return detect(notes)
  }, [notes, gameMode])

  // Track container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Generate stars
  const stars = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      twinkle: Math.random() > 0.7,
      delay: Math.random() * 5,
    }))
  }, [])

  const playerX = dimensions.width / 2
  const playerY = dimensions.height - 90

  const triggerShake = useCallback(() => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 150)
  }, [])

  const spawnParticles = useCallback((x, y) => {
    const colors = getParticleColors()
    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2
      const velocity = 50 + Math.random() * 100
      return {
        id: Date.now() + i + Math.random(),
        x,
        y,
        tx: Math.cos(angle) * velocity,
        ty: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
      }
    })
    setParticles(prev => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
    }, 600)
  }, [])

  const spawnScorePopup = useCallback((x, y, points) => {
    const id = Date.now() + Math.random()
    setScorePopups(prev => [...prev, { id, x, y, points }])
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== id))
    }, 800)
  }, [])

  const startGame = useCallback((mode = gameMode) => {
    setGameMode(mode)
    setGameState('playing')
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setEnemies([])
    setLasers([])
    setParticles([])
    setScorePopups([])
    lastNotesRef.current = []
    lastChordsRef.current = []
  }, [gameMode])

  const endGame = useCallback(() => {
    setGameState('gameover')
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current)
  }, [])

  // Spawn enemies based on game mode
  useEffect(() => {
    if (gameState !== 'playing') return

    const spawnEnemy = () => {
      const margin = 80
      let target, type

      if (gameMode === 'notes') {
        target = getRandomNote()
        type = 'note'
      } else if (gameMode === 'triads') {
        target = getRandomTriad()
        type = 'chord'
      } else {
        target = getRandomComplexChord()
        type = 'chord'
      }

      setEnemies(prev => [...prev, {
        id: Date.now() + Math.random(),
        target,
        type,
        x: Math.random() * (dimensions.width - margin * 2) + margin,
        y: -80,
      }])
    }

    const spawnInterval = MODES[gameMode].spawnInterval
    const initialTimeout = setTimeout(spawnEnemy, 300)
    spawnIntervalRef.current = setInterval(spawnEnemy, spawnInterval)

    return () => {
      clearTimeout(initialTimeout)
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
    }
  }, [gameState, gameMode, dimensions.width])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      setEnemies(prev => {
        const updated = prev.map(e => ({ ...e, y: e.y + ENEMY_SPEED }))
        if (updated.some(e => e.y > dimensions.height - 140)) {
          endGame()
          return prev
        }
        return updated
      })
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, endGame, dimensions.height])

  // Helper to hit an enemy
  const hitEnemy = useCallback((targetEnemy, bonusMultiplier = 1) => {
    // Fire laser
    const laserId = Date.now() + Math.random()
    setLasers(prev => [...prev, {
      id: laserId,
      startX: playerX,
      startY: playerY,
      endX: targetEnemy.x,
      endY: targetEnemy.y + 40,
    }])

    setTimeout(() => {
      setLasers(prev => prev.filter(l => l.id !== laserId))
    }, LASER_DURATION)

    // Particles and effects
    spawnParticles(targetEnemy.x, targetEnemy.y + 20)
    triggerShake()

    // Update combo
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current)
    setCombo(prev => {
      const newCombo = prev + 1
      setMaxCombo(max => Math.max(max, newCombo))
      return newCombo
    })
    comboTimeoutRef.current = setTimeout(() => setCombo(0), COMBO_TIMEOUT)

    // Calculate points (chords worth more)
    const basePoints = targetEnemy.type === 'chord' ? 200 : 100
    const points = (basePoints + (combo * 50)) * bonusMultiplier
    spawnScorePopup(targetEnemy.x, targetEnemy.y, Math.round(points))
    setScore(prev => prev + Math.round(points))

    // Remove enemy
    setEnemies(prev => prev.filter(e => e.id !== targetEnemy.id))
  }, [playerX, playerY, combo, spawnParticles, triggerShake, spawnScorePopup])

  // Handle note input (notes mode)
  useEffect(() => {
    if (gameState !== 'playing' || gameMode !== 'notes') return
    if (notes.length === 0) return

    const newNotes = notes.filter(n => !lastNotesRef.current.includes(n))
    lastNotesRef.current = [...notes]

    if (newNotes.length === 0) return

    newNotes.forEach(playedNote => {
      const playedPitch = Note.pitchClass(playedNote)

      // Find all matching enemies (note type only)
      const matchingEnemies = enemies.filter(e =>
        e.type === 'note' && Note.pitchClass(e.target) === playedPitch
      )

      if (matchingEnemies.length > 0) {
        // Pick a random one from matching enemies
        const targetEnemy = matchingEnemies[Math.floor(Math.random() * matchingEnemies.length)]
        hitEnemy(targetEnemy)
      } else {
        // Wrong note
        endGame()
      }
    })
  }, [notes, enemies, gameState, gameMode, endGame, hitEnemy])

  // Handle chord input (triads and complex modes)
  useEffect(() => {
    if (gameState !== 'playing' || gameMode === 'notes') return
    if (detectedChords.length === 0) {
      lastChordsRef.current = []
      return
    }

    // Only process if we have enough notes for the mode
    const minNotes = gameMode === 'triads' ? 3 : 3
    if (notes.length < minNotes) {
      lastChordsRef.current = [...detectedChords]
      return
    }

    // Check if this is a new chord (different from last detected)
    const isNewChord = detectedChords.length > 0 &&
      (lastChordsRef.current.length === 0 ||
       detectedChords[0] !== lastChordsRef.current[0])

    if (!isNewChord) {
      return
    }

    // Find matching enemy for any detected chord
    let foundMatch = false
    for (const detectedChord of detectedChords) {
      const matchingEnemies = enemies.filter(e => {
        if (e.type !== 'chord') return false
        return chordsMatch(detectedChord, e.target)
      })

      if (matchingEnemies.length > 0) {
        const targetEnemy = matchingEnemies[Math.floor(Math.random() * matchingEnemies.length)]
        hitEnemy(targetEnemy, gameMode === 'complex' ? 1.5 : 1)
        foundMatch = true
        lastChordsRef.current = [...detectedChords]
        return
      }
    }

    // Wrong chord - only end game if there are enemies on screen
    if (!foundMatch && enemies.some(e => e.type === 'chord')) {
      endGame()
    }

    lastChordsRef.current = [...detectedChords]
  }, [detectedChords, enemies, gameState, gameMode, notes.length, endGame, hitEnemy])

  // Laser geometry
  const getLaserStyle = (laser) => {
    const dx = laser.endX - laser.startX
    const dy = laser.endY - laser.startY
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90

    return {
      left: laser.startX - 4,
      top: laser.startY,
      height: length,
      transform: `rotate(${angle}deg)`,
      transformOrigin: 'top center',
    }
  }

  return (
    <div
      className={`${classes.root} ${isShaking ? classes.shaking : ''}`}
      ref={containerRef}
    >
      {/* Background layers */}
      <div className={classes.nebula} />
      <div className={classes.starsContainer}>
        {stars.map(star => (
          <div
            key={star.id}
            className={`${classes.star} ${star.twinkle ? classes.starTwinkle : ''}`}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
      <div className={classes.gridOverlay} />

      {/* HUD */}
      {gameState === 'playing' && (
        <div className={classes.hud}>
          <div className={classes.scorePanel}>
            <div className={classes.scoreLabel}>Score</div>
            <div className={classes.scoreValue}>{String(score).padStart(6, '0')}</div>
          </div>
          <div className={classes.modeIndicator}>
            <div className={classes.modeIndicatorText}>{MODES[gameMode].name} Mode</div>
          </div>
          {combo > 1 && (
            <div className={classes.comboPanel}>
              <div className={classes.comboText}>{combo}x COMBO!</div>
            </div>
          )}
        </div>
      )}

      {/* Enemies */}
      {enemies.map(enemy => (
        <div
          key={enemy.id}
          className={classes.enemy}
          style={{ left: enemy.x - 35, top: enemy.y }}
        >
          <div className={classes.enemyGlow} />
          <span className={classes.chicken}>🐔</span>
          <span className={enemy.type === 'chord' ? classes.chordLabel : classes.noteLabel}>
            {enemy.type === 'chord' ? formatChord(enemy.target) : formatNote(enemy.target)}
          </span>
        </div>
      ))}

      {/* Lasers */}
      {lasers.map(laser => (
        <div
          key={laser.id}
          className={classes.laser}
          style={getLaserStyle(laser)}
        />
      ))}

      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className={classes.particle}
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size}px ${p.color}`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
          }}
        />
      ))}

      {/* Score popups */}
      {scorePopups.map(popup => (
        <div
          key={popup.id}
          className={classes.scorePopup}
          style={{ left: popup.x - 30, top: popup.y }}
        >
          +{popup.points}
        </div>
      ))}

      {/* Player */}
      {gameState === 'playing' && (
        <div className={classes.playerContainer}>
          <div className={classes.player}>
            <div className={classes.playerWings} />
            <div className={classes.playerBody} />
            <div className={classes.playerCannon} />
            <div className={classes.playerEngine} />
          </div>
        </div>
      )}

      {/* Note hint */}
      {gameState === 'playing' && (
        <div className={classes.noteHint}>
          {gameMode === 'notes'
            ? 'Play the note shown on each chicken to destroy it'
            : `Play the ${gameMode === 'triads' ? 'triad chord' : 'chord'} shown to destroy chickens`
          }
        </div>
      )}

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className={classes.overlay}>
          <div className={classes.titleContainer}>
            <div className={classes.titleMain}>
              <span className={classes.titleIcon}>🐔</span>
              C-hicken Invaders
              <span className={classes.titleIcon}>🎹</span>
            </div>
            <div className={classes.titleSub}>A Musical Space Battle</div>
          </div>

          <div className={classes.modeSelector}>
            <ButtonGroup>
              {Object.entries(MODES).map(([key, mode]) => (
                <Button
                  key={key}
                  className={`${classes.modeButton} ${gameMode === key ? classes.modeButtonActive : ''}`}
                  onClick={() => setGameMode(key)}
                >
                  {mode.name}
                </Button>
              ))}
            </ButtonGroup>
            <div className={classes.modeDescription}>
              {MODES[gameMode].description}
            </div>
          </div>

          <div className={classes.instructions}>
            {gameMode === 'notes' ? (
              <>
                <span className={classes.instructionIcon}>🎹</span>
                <strong>Play the correct note</strong> to shoot chickens
              </>
            ) : (
              <>
                <span className={classes.instructionIcon}>🎹</span>
                <strong>Play the correct {gameMode === 'triads' ? 'chord' : 'chord'}</strong> to shoot chickens
              </>
            )}
            <br />
            <span className={classes.instructionIcon}>❌</span>
            Wrong {gameMode === 'notes' ? 'note' : 'chord'} = <strong>Game Over</strong>
            <br />
            <span className={classes.instructionIcon}>⚡</span>
            Chain hits for <strong>combo multipliers</strong>
            <br />
            <span className={classes.instructionIcon}>🛡️</span>
            Don't let them reach the bottom!
          </div>
          <Button className={classes.startButton} onClick={() => startGame(gameMode)}>
            Start Mission
          </Button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className={classes.overlay}>
          <div className={classes.gameOverTitle}>MISSION FAILED</div>
          <div className={classes.modeIndicator} style={{ marginBottom: 20 }}>
            <div className={classes.modeIndicatorText}>{MODES[gameMode].name} Mode</div>
          </div>
          <div className={classes.statsContainer}>
            <div className={classes.statBox}>
              <div className={classes.statLabel}>Final Score</div>
              <div className={`${classes.statValue} ${classes.statValueScore}`}>{score}</div>
            </div>
            <div className={classes.statBox}>
              <div className={classes.statLabel}>Max Combo</div>
              <div className={`${classes.statValue} ${classes.statValueCombo}`}>{maxCombo}x</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Button className={classes.playAgainButton} onClick={() => startGame(gameMode)}>
              Try Again
            </Button>
            <Button
              className={classes.playAgainButton}
              style={{ background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }}
              onClick={() => setGameState('start')}
            >
              Change Mode
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = {
  id: 'chicken-invaders',
  name: 'C-hicken Invaders',
  description: 'Shoot chickens by playing the correct notes!',
  showInMenu: true,
}
