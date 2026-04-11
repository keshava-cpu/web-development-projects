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
  const [revealId, setRevealId] = useState(0)
  const [cursorEndPx, setCursorEndPx] = useState(0)
  const inputTrackRef = useRef(null)
  const measureTextRef = useRef(null)
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
      setRevealId((prev) => prev + 1)
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

  return (
    <>
      <section id="center">
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
              ref={inputTrackRef}
              style={{ position: 'relative', flex: 1, overflow: 'hidden', borderRadius: 8 }}
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
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-h)',
                  fontSize: 14,
                }}
              />
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
            {submittedText && (
              <motion.div
                key={`${submittedText}-${revealId}`}
                initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)', scale: 0.94, y: 8 }}
                animate={{ opacity: 1, clipPath: 'circle(140% at 50% 50%)', scale: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  padding: '8px 10px',
                  borderRadius: 10,
                  color: 'var(--text-h)',
                  background: 'radial-gradient(circle at 35% 40%, #2b2e45 0%, #202334 45%, #181a27 100%)',
                  border: '1px solid #3b3f57',
                  boxShadow: '0 8px 22px rgba(0, 0, 0, 0.35)',
                }}
              >
                You wrote: {submittedText}
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

      <section id="next-steps">
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
      <section id="spacer"></section>
    </>
  )
}

export default App
