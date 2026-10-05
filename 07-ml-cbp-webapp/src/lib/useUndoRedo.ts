import { useCallback, useEffect, useRef, useState } from 'react'

export function useUndoRedo<T>(initialValue: T, maxHistory = 80) {
  const [history, setHistory] = useState<T[]>([initialValue])
  const [index, setIndex] = useState(0)
  const historyRef = useRef(history)
  const indexRef = useRef(index)

  useEffect(() => {
    historyRef.current = history
    indexRef.current = index
  }, [history, index])

  const setValue = useCallback(
    (nextValue: T | ((previous: T) => T)) => {
      const current = historyRef.current[indexRef.current]
      const resolved = typeof nextValue === 'function' ? (nextValue as (previous: T) => T)(current) : nextValue

      if (Object.is(resolved, current)) {
        return
      }

      const nextHistory = [...historyRef.current.slice(0, indexRef.current + 1), resolved]
      const trimmedHistory = nextHistory.length > maxHistory ? nextHistory.slice(nextHistory.length - maxHistory) : nextHistory
      const nextIndex = trimmedHistory.length - 1

      historyRef.current = trimmedHistory
      setHistory(trimmedHistory)
      indexRef.current = nextIndex
      setIndex(nextIndex)
    },
    [maxHistory],
  )

  const undo = useCallback(() => {
    setIndex((currentIndex) => {
      const nextIndex = Math.max(0, currentIndex - 1)
      indexRef.current = nextIndex
      return nextIndex
    })
  }, [])

  const redo = useCallback(() => {
    setIndex((currentIndex) => {
      const nextIndex = Math.min(historyRef.current.length - 1, currentIndex + 1)
      indexRef.current = nextIndex
      return nextIndex
    })
  }, [])

  return {
    value: history[index],
    setValue,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  }
}
