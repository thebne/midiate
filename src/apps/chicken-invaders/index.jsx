import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { Note } from '@tonaljs/tonal'
import { useNotes } from '../../api/notes'

const ENEMY_SPEED = 0.6
const SPAWN_INTERVAL = 2200
const LASER_DURATION = 200
const PARTICLE_COUNT = 12
const COMBO_TIMEOUT = 1500

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
}))

// Available notes (C3 to C5)
const AVAILABLE_NOTES = []
for (let midi = 48; midi <= 72; midi++) {
  AVAILABLE_NOTES.push(Note.fromMidi(midi))
}

const getRandomNote = () => AVAILABLE_NOTES[Math.floor(Math.random() * AVAILABLE_NOTES.length)]

// Format note: uppercase letter, lowercase flat (e.g., "Bb" not "BB")
const formatNote = (note) => {
  const pitch = Note.pitchClass(note)
  if (pitch.length === 1) return pitch.toUpperCase()
  return pitch[0].toUpperCase() + pitch.slice(1).toLowerCase()
}

const getParticleColors = () => ['#fbbf24', '#f59e0b', '#ef4444', '#ffffff', '#fb923c']

export default function ChickenInvaders() {
  const classes = useStyles()
  const notes = useNotes()
  const [gameState, setGameState] = useState('start')
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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

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

  const startGame = useCallback(() => {
    setGameState('playing')
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setEnemies([])
    setLasers([])
    setParticles([])
    setScorePopups([])
    lastNotesRef.current = []
  }, [])

  const endGame = useCallback(() => {
    setGameState('gameover')
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current)
  }, [])

  // Spawn enemies
  useEffect(() => {
    if (gameState !== 'playing') return

    const spawnEnemy = () => {
      const note = getRandomNote()
      const margin = 80
      setEnemies(prev => [...prev, {
        id: Date.now() + Math.random(),
        note,
        x: Math.random() * (dimensions.width - margin * 2) + margin,
        y: -80,
      }])
    }

    const initialTimeout = setTimeout(spawnEnemy, 300)
    spawnIntervalRef.current = setInterval(spawnEnemy, SPAWN_INTERVAL)

    return () => {
      clearTimeout(initialTimeout)
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
    }
  }, [gameState, dimensions.width])

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

  // Handle note input
  useEffect(() => {
    if (gameState !== 'playing') return
    if (notes.length === 0) return

    const newNotes = notes.filter(n => !lastNotesRef.current.includes(n))
    lastNotesRef.current = [...notes]

    if (newNotes.length === 0) return

    newNotes.forEach(playedNote => {
      const playedPitch = Note.pitchClass(playedNote)

      // Find all matching enemies
      const matchingEnemies = enemies.filter(e => Note.pitchClass(e.note) === playedPitch)

      if (matchingEnemies.length > 0) {
        // Pick a random one from matching enemies
        const targetEnemy = matchingEnemies[Math.floor(Math.random() * matchingEnemies.length)]

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

        // Calculate points
        const points = 100 + (combo * 50)
        spawnScorePopup(targetEnemy.x, targetEnemy.y, points)
        setScore(prev => prev + points)

        // Remove enemy
        setEnemies(prev => prev.filter(e => e.id !== targetEnemy.id))
      } else {
        // Wrong note
        endGame()
      }
    })
  }, [notes, enemies, gameState, endGame, playerX, playerY, combo, spawnParticles, triggerShake, spawnScorePopup])

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
          <span className={classes.noteLabel}>{formatNote(enemy.note)}</span>
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
          Play the note shown on each chicken to destroy it
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
          <div className={classes.instructions}>
            <span className={classes.instructionIcon}>🎹</span>
            <strong>Play the correct note</strong> to shoot chickens
            <br />
            <span className={classes.instructionIcon}>❌</span>
            Wrong note = <strong>Game Over</strong>
            <br />
            <span className={classes.instructionIcon}>⚡</span>
            Chain hits for <strong>combo multipliers</strong>
            <br />
            <span className={classes.instructionIcon}>🛡️</span>
            Don't let them reach the bottom!
          </div>
          <Button className={classes.startButton} onClick={startGame}>
            Start Mission
          </Button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className={classes.overlay}>
          <div className={classes.gameOverTitle}>MISSION FAILED</div>
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
          <Button className={classes.playAgainButton} onClick={startGame}>
            Try Again
          </Button>
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
