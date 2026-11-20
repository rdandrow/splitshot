import { describe, expect, it, beforeEach } from 'vitest'
import { useLayoutModeStore } from './layoutMode'

describe('useLayoutModeStore', () => {
  beforeEach(() => {
    useLayoutModeStore.setState({ mode: 'match-height' })
  })

  it('defaults to match-height', () => {
    expect(useLayoutModeStore.getState().mode).toBe('match-height')
  })

  it('switches to another normalization mode', () => {
    useLayoutModeStore.getState().setMode('fit')

    expect(useLayoutModeStore.getState().mode).toBe('fit')
  })
})
