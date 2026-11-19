import { describe, expect, it, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { useImageSlotsStore } from './store/imageSlots'

describe('App', () => {
  afterEach(() => {
    useImageSlotsStore.setState({ slots: { A: null, B: null } })
  })

  it('renders an Expected and an Actual image slot', () => {
    render(<App />)

    expect(screen.getByText('Expected')).toBeInTheDocument()
    expect(screen.getByText('Actual')).toBeInTheDocument()
  })
})
