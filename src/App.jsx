import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { AnimatePresence, motion } from 'motion/react'

const MAX_INPUT_LENGTH = 48
const NAV_ITEMS = ['Home', 'Work', 'About', 'Contact']

const LIST_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
}

const ITEM_VARIANTS = {
  hidden: { x: -20, opacity: 0 },
  visible: (index = 0) => ({
    x: index * 10,
    opacity: 1,
    transition: { duration: 0.5, type: 'spring' },
  }),
}

const SIDEBAR_VARIANTS = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
}

const LINK_VARIANTS = {
  open: { opacity: 1, y: 10 },
  closed: { opacity: 0, y: 20 },
}

function App() {
  const [count, setCount] = useState(0)
  const [isVisible] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isOn, setIsOn] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [processingText, setProcessingText] = useState('')
  const [submittedText, setSubmittedText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAppearedOnce, setHasAppearedOnce] = useState(false)
  const [isOutputVisible, setIsOutputVisible] = useState(false)
  const [textChangeTick, setTextChangeTick] = useState(0)
  const [cursorEndPx, setCursorEndPx] = useState(0)
  const inputGlassRef = useRef(null)
  const inputTrackRef = useRef(null)
  const measureTextRef = useRef(null)
  const outputTileRef = useRef(null)
  const closeButtonRef = useRef(null)
  const graphCanvasRef = useRef(null)
  const graphPointerRef = useRef({ x: 0, y: 0, clientY: 0, active: false })
  const graphScrollRef = useRef(0)
  const submitTimerRef = useRef(null)
  const processingChars = useMemo(() => processingText.split(''), [processingText])

  const handleTextSubmit = () => {
    const trimmedValue = draftText.trim()
    if (!trimmedValue || isSubmitting) return

    const submitDuration = Math.min(2200, Math.max(900, 420 + trimmedValue.length * 55))

    setProcessingText(trimmedValue)
    setIsSubmitting(true)
    submitTimerRef.current = window.setTimeout(() => {
      setSubmittedText(trimmedValue)
      setDraftText('')
      setProcessingText('')
      setTextChangeTick((prev) => prev + 1)
      if (!isOutputVisible) {
        setIsOutputVisible(true)
      }
      setIsSubmitting(false)
    }, submitDuration)
  }

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current)
      }
    }
  }, [])

  useLayoutEffect(() => {
    if (!isSubmitting || !inputTrackRef.current || !measureTextRef.current) return

    const trackWidth = inputTrackRef.current.clientWidth
    const textWidth = measureTextRef.current.offsetWidth
    const leftPadding = 12
    const knobWidth = 10
    const maxLeft = Math.max(0, trackWidth - knobWidth)
    const targetLeft = Math.min(maxLeft, leftPadding + textWidth)

    setCursorEndPx(targetLeft)
  }, [isSubmitting, processingText])

  useEffect(() => {
    const canvas = graphCanvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let frameId = 0
    let width = 0
    let height = 0
    let pageHeight = 0
    const nodes = []

    const buildGraph = () => {
      nodes.length = 0
      const spacing = 120
      const jitter = 22

      for (let y = spacing * 0.5; y < pageHeight + spacing; y += spacing) {
        for (let x = spacing * 0.5; x < width + spacing; x += spacing) {
          nodes.push({
            x: x + (Math.random() - 0.5) * jitter,
            y: y + (Math.random() - 0.5) * jitter,
          })
        }
      }
    }

    const updatePageHeight = () => {
      const doc = document.documentElement
      const nextPageHeight = Math.max(doc.scrollHeight, doc.clientHeight)
      if (nextPageHeight !== pageHeight) {
        pageHeight = nextPageHeight
        buildGraph()
      }
    }

    const resizeCanvas = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = window.devicePixelRatio || 1

      updatePageHeight()

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawGraph = () => {
      const scrollY = graphScrollRef.current * 1.08
      const viewportHeight = window.innerHeight
      context.clearRect(0, 0, width, height)

      const pointer = graphPointerRef.current
      const influenceRadius = 190
      const linkRadius = 168

      const displaced = nodes.map((node) => {
        if (!pointer.active) return { x: node.x, y: node.y, influence: 0 }

        const dx = pointer.x - node.x
        const dy = pointer.y - node.y
        const distance = Math.hypot(dx, dy)

        if (distance > influenceRadius || distance === 0) {
          return { x: node.x, y: node.y, influence: 0 }
        }

        const t = 1 - distance / influenceRadius
        const eased = t * t * (3 - 2 * t)
        const pull = eased * 14

        return {
          x: node.x + (dx / distance) * pull,
          y: node.y + (dy / distance) * pull,
          influence: eased,
        }
      })

      for (let i = 0; i < displaced.length; i += 1) {
        const a = displaced[i]

        for (let j = i + 1; j < displaced.length; j += 1) {
          const b = displaced[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const distance = Math.hypot(dx, dy)

          if (distance > linkRadius) continue

          const linkStrength = 1 - distance / linkRadius
          const glowBoost = (a.influence + b.influence) * 0.14
          const alpha = 0.04 + linkStrength * 0.12 + glowBoost

          context.strokeStyle = `rgba(173, 154, 255, ${alpha.toFixed(3)})`
          context.lineWidth = 1
          context.beginPath()
          context.moveTo(a.x, a.y - scrollY)
          context.lineTo(b.x, b.y - scrollY)
          context.stroke()
        }
      }

      for (let i = 0; i < displaced.length; i += 1) {
        const node = displaced[i]
        const nodeAlpha = 0.3 + node.influence * 0.55
        const screenY = node.y - scrollY

        if (screenY < -24 || screenY > viewportHeight + 24) continue

        context.fillStyle = `rgba(198, 183, 255, ${nodeAlpha.toFixed(3)})`
        context.beginPath()
        context.arc(node.x, screenY, 1.9 + node.influence * 1.2, 0, Math.PI * 2)
        context.fill()
      }

      frameId = window.requestAnimationFrame(drawGraph)
    }

    const handlePointerMove = (event) => {
      graphPointerRef.current = {
        x: event.clientX,
        y: event.clientY + window.scrollY,
        clientY: event.clientY,
        active: true,
      }
    }

    const handlePointerLeave = () => {
      graphPointerRef.current.active = false
    }

    const handleScroll = () => {
      graphScrollRef.current = window.scrollY
      updatePageHeight()

      if (graphPointerRef.current.active) {
        graphPointerRef.current.y = graphPointerRef.current.clientY + window.scrollY
      }
    }

    graphScrollRef.current = window.scrollY
    resizeCanvas()
    drawGraph()

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  useEffect(() => {
    let rafId = 0

    const updateTileGlow = (tile, event) => {
      if (!tile) return

      const rect = tile.getBoundingClientRect()
      const localX = event.clientX - rect.left
      const localY = event.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const distanceToCenter = Math.hypot(localX - centerX, localY - centerY)
      const cutoffDistance = Math.max(rect.width, rect.height) * 1.65
      const proximity = Math.max(0, 1 - distanceToCenter / cutoffDistance)
      const easedProximity = proximity * proximity * (3 - 2 * proximity)
      const alpha = easedProximity < 0.03 ? 0 : easedProximity * 0.48

      tile.style.setProperty('--mx', `${localX}px`)
      tile.style.setProperty('--my', `${localY}px`)
      tile.style.setProperty('--ga', alpha.toFixed(3))
    }

    const applyProximityGlow = (event) => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }

      rafId = window.requestAnimationFrame(() => {
        updateTileGlow(outputTileRef.current, event)
        updateTileGlow(inputGlassRef.current, event)

        if (closeButtonRef.current) {
          const rect = closeButtonRef.current.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY)
          const cutoffDistance = Math.max(rect.width, rect.height) * 2.35
          const proximity = Math.max(0, 1 - distance / cutoffDistance)
          const easedProximity = proximity * proximity * (3 - 2 * proximity)
          const alpha = easedProximity < 0.03 ? 0 : easedProximity * 0.46
          closeButtonRef.current.style.setProperty('--cg', alpha.toFixed(3))
        }
      })
    }

    const clearGlow = () => {
      if (outputTileRef.current) {
        outputTileRef.current.style.setProperty('--ga', '0')
      }
      if (inputGlassRef.current) {
        inputGlassRef.current.style.setProperty('--ga', '0')
      }
      if (closeButtonRef.current) {
        closeButtonRef.current.style.setProperty('--cg', '0')
      }
    }

    window.addEventListener('pointermove', applyProximityGlow, { passive: true })
    window.addEventListener('pointerleave', clearGlow)

    return () => {
      window.removeEventListener('pointermove', applyProximityGlow)
      window.removeEventListener('pointerleave', clearGlow)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <>
      <canvas
        ref={graphCanvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <section id="center" style={{ position: 'relative', zIndex: 1 }}>
        <div className="app-container">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="site-nav"
          >
            {isOpen ? 'Close' : 'Open'} Menu
          </button>

          <motion.nav
            id="site-nav"
            initial="closed"
            animate={isOpen ? 'open' : 'closed'}
            variants={SIDEBAR_VARIANTS}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '250px',
              height: '100%',
              background: '#111',
              padding: '50px 20px',
            }}
          >
            <motion.ul style={{ listStyle: 'none', padding: 0 }}>
              {NAV_ITEMS.map((item) => (
                <motion.li
                  key={item}
                  variants={LINK_VARIANTS}
                  style={{ margin: '20px 0' }}
                >
                  <a href={`#${item}`} style={{ color: 'white', fontSize: '24px' }}>
                    {item}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.nav>
        </div>

        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" decoding="async" />
          <img src={reactLogo} className="framework" alt="React logo" decoding="async" />
          <img src={viteLogo} className="vite" alt="Vite logo" decoding="async" />
        </div>

        <div>
          <h1>Testing GitHub</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>

        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.8 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          Hello World!
        </motion.div>

        <motion.ul variants={LIST_VARIANTS} initial="hidden" animate="visible">
          <motion.li custom={0} variants={ITEM_VARIANTS} whileHover={{ scale: 1.2 }}>
            Hi
          </motion.li>
          <motion.li custom={1} variants={ITEM_VARIANTS} whileHover={{ scale: 1.2 }}>
            Bye
          </motion.li>
        </motion.ul>

        <div
          onClick={() => setIsOn((prev) => !prev)}
          style={{
            width: 60,
            height: 30,
            background: isOn ? '#22c55e' : 'var(--code-bg)',
            borderRadius: 50,
            padding: 5,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--border)',
          }}
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 30 }}
            dragElastic={0.01}
            dragMomentum={false}
            onDragEnd={(event, info) => {
              setIsOn(info.offset.x > 15)
            }}
            animate={{ x: isOn ? 30 : 0, width: isOn ? 25 : 20, height: isOn ? 25 : 20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'var(--text-h)',
            }}
          />
        </div>

        <motion.button
          type="button"
          onClick={() => setIsOn((prev) => !prev)}
          whileTap={{ y: 2, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 700, damping: 28 }}
          aria-pressed={isOn}
          style={{
            marginTop: 8,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--code-bg)',
            color: 'var(--text-h)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          Toggle status: {isOn ? 'On' : 'Off'}
        </motion.button>

        <div style={{ width: '100%', maxWidth: 380, marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div
              ref={inputGlassRef}
              style={{
                position: 'relative',
                flex: 1,
                overflow: 'hidden',
                borderRadius: 10,
                padding: 2,
                background:
                  'radial-gradient(160px circle at var(--mx, 50%) var(--my, 50%), rgb(124 92 255 / var(--ga, 0)) 0%, rgb(124 92 255 / 0) 74%), linear-gradient(140deg, color-mix(in srgb, var(--bg) 74%, transparent) 0%, color-mix(in srgb, var(--bg) 62%, transparent) 100%)',
                backdropFilter: 'blur(20px) saturate(112%)',
                WebkitBackdropFilter: 'blur(20px) saturate(112%)',
                border: '0.75px solid color-mix(in srgb, var(--border) 84%, white 16%)',
                boxShadow:
                  'inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 -10px 20px rgba(255, 255, 255, 0.03), 0 10px 20px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div
                ref={inputTrackRef}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 8,
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--bg) 95%, transparent) 0%, color-mix(in srgb, var(--bg) 92%, transparent) 100%)',
                  border: '0.75px solid color-mix(in srgb, var(--border) 70%, transparent)',
                  boxShadow:
                    'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 14px rgba(124, 92, 255, 0.12)',
                }}
              >
                <input
                  type="text"
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value.slice(0, MAX_INPUT_LENGTH))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleTextSubmit()
                  }}
                  maxLength={MAX_INPUT_LENGTH}
                  placeholder="Type something..."
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 34px 10px 12px',
                    borderRadius: 8,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text-h)',
                    fontSize: 14,
                  }}
                />
              </div>
              {isSubmitting && (
                <>
                  <span
                    ref={measureTextRef}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      visibility: 'hidden',
                      whiteSpace: 'pre',
                      fontSize: 14,
                      letterSpacing: 0.2,
                      paddingInline: 0,
                    }}
                  >
                    {processingText}
                  </span>
                  <motion.div
                    initial={{ x: '-12%' }}
                    animate={{ x: '112%' }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      insetBlock: 0,
                      width: 32,
                      background:
                        'linear-gradient(90deg, rgba(170,59,255,0) 0%, rgba(170,59,255,0.58) 45%, rgba(170,59,255,0) 100%)',
                      mixBlendMode: 'multiply',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      paddingInline: 12,
                      color: 'var(--text-h)',
                      fontSize: 14,
                      letterSpacing: 0.2,
                      background: 'color-mix(in srgb, var(--bg) 76%, transparent)',
                      pointerEvents: 'none',
                    }}
                  >
                    {processingChars.map((char, index) => (
                      <motion.span
                        key={`${char}-${index}`}
                        animate={{ opacity: [1, 1, 0.18] }}
                        transition={{ duration: 0.95, repeat: Infinity, delay: index * 0.035 }}
                        style={{ whiteSpace: 'pre' }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                </>
              )}
              {isSubmitting && (
                <motion.span
                  initial={{ left: 0 }}
                  animate={{ left: cursorEndPx, opacity: [1, 0.55, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    width: 10,
                    height: 19,
                    marginTop: -9,
                    background: '#7CFC9B',
                    borderRadius: 0,
                    boxShadow: '0 0 0 1px rgba(124,252,155,0.45), 0 0 12px rgba(124,252,155,0.45)',
                    zIndex: 4,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
            <motion.button
              type="button"
              onClick={handleTextSubmit}
              disabled={isSubmitting || !draftText.trim()}
              whileTap={{ y: 2 }}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                color: 'var(--text-h)',
                border: '1px solid var(--border)',
                background: 'var(--code-bg)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {isSubmitting ? 'Loading...' : 'Send'}
            </motion.button>
          </div>
          <p style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            {draftText.length}/{MAX_INPUT_LENGTH}
          </p>
          <AnimatePresence mode="wait">
            {submittedText && isOutputVisible && (
              <motion.div
                ref={outputTileRef}
                initial={hasAppearedOnce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.985 }}
                whileHover={{ y: -3, transition: { type: 'spring', stiffness: 420, damping: 28 } }}
                whileTap={{ y: 1, transition: { type: 'spring', stiffness: 520, damping: 32 } }}
                onAnimationComplete={() => {
                  if (!hasAppearedOnce) {
                    setHasAppearedOnce(true)
                  }
                }}
                style={{
                  position: 'relative',
                  overflow: 'visible',
                  marginTop: 10,
                  padding: 2,
                  borderRadius: 10,
                  background:
                    'radial-gradient(170px circle at var(--mx, 50%) var(--my, 50%), rgb(124 92 255 / var(--ga, 0)) 0%, rgb(124 92 255 / 0) 74%), linear-gradient(140deg, color-mix(in srgb, var(--bg) 74%, transparent) 0%, color-mix(in srgb, var(--bg) 62%, transparent) 100%)',
                  backdropFilter: 'blur(20px) saturate(112%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(112%)',
                  border: '0.75px solid color-mix(in srgb, var(--border) 84%, white 16%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 -10px 20px rgba(255, 255, 255, 0.03), 0 10px 20px rgba(0, 0, 0, 0.2)',
                }}
              >
                <motion.button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Close output tile"
                  onClick={() => setIsOutputVisible(false)}
                  whileHover={{
                    scale: 1.04,
                    y: -1,
                    transition: { type: 'spring', stiffness: 420, damping: 24 },
                  }}
                  whileTap={{
                    scale: 0.95,
                    y: 1,
                    transition: { type: 'spring', stiffness: 520, damping: 28 },
                  }}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '0.75px solid rgba(255, 140, 165, 0.42)',
                    background:
                      'linear-gradient(155deg, rgba(36,24,34,0.72) 0%, rgba(46,26,40,0.62) 34%, rgba(96,34,58,0.52) 100%)',
                    backdropFilter: 'blur(44px) saturate(172%) brightness(92%)',
                    WebkitBackdropFilter: 'blur(44px) saturate(172%) brightness(92%)',
                    color: 'rgba(255, 130, 155, 0.96)',
                    fontSize: 11,
                    lineHeight: '18px',
                    boxShadow:
                      'inset 0 1px 0 rgba(255, 176, 200, 0.24), inset 0 -4px 12px rgba(80, 24, 48, 0.42), 0 0 16px rgba(255, 108, 148, var(--cg, 0)), 0 6px 15px rgba(24, 8, 18, 0.46), 0 0 0 1px rgba(255, 130, 165, 0.13)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    zIndex: 10,
                    '--cg': 0,
                  }}
                >
                  x
                </motion.button>
                <div
                  style={{
                    position: 'relative',
                    zIndex: 4,
                    borderRadius: 8,
                    padding: '8px 28px 8px 10px',
                    fontSize: 14,
                    color: 'var(--text-h)',
                    background:
                      'linear-gradient(180deg, color-mix(in srgb, var(--bg) 95%, transparent) 0%, color-mix(in srgb, var(--bg) 92%, transparent) 100%)',
                    border: '0.75px solid color-mix(in srgb, var(--border) 70%, transparent)',
                    boxShadow:
                      'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 14px rgba(124, 92, 255, 0.12)',
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={textChangeTick}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'inline-block' }}
                    >
                      You wrote: {submittedText}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <button className="counter" onClick={() => setCount((value) => value + 1)}>
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps" style={{ position: 'relative', zIndex: 1 }}>
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" loading="lazy" decoding="async" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" loading="lazy" decoding="async" />
                Learn more
              </a>
            </li>
          </ul>
        </div>

        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer" style={{ position: 'relative', zIndex: 1 }}></section>
    </>
  )
}

export default App
