import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComparisonView } from './ComparisonView'
import { useImageSlotsStore } from '../store/imageSlots'
import { useLayoutModeStore } from '../store/layoutMode'

vi.mock('./ComparisonCanvas', () => ({
  ComparisonCanvas: () => <div data-testid="canvas-stub" />,
}))

const sampleImage = { name: 'shot.png', dataUrl: 'data:image/png;base64,abc', width: 100, height: 50 }

describe('ComparisonView', () => {
  afterEach(() => {
    cleanup()
    useImageSlotsStore.setState({ slots: { A: null, B: null } })
    useLayoutModeStore.setState({ mode: 'match-height' })
  })

  it('renders nothing until both slots have an image', () => {
    render(<ComparisonView />)

    expect(screen.queryByTestId('canvas-stub')).not.toBeInTheDocument()

    useImageSlotsStore.getState().setSlotImage('A', sampleImage)
    expect(screen.queryByTestId('canvas-stub')).not.toBeInTheDocument()
  })

  it('shows the canvas and a mode selector once both slots are filled', () => {
    useImageSlotsStore.getState().setSlotImage('A', sampleImage)
    useImageSlotsStore.getState().setSlotImage('B', sampleImage)

    render(<ComparisonView />)

    expect(screen.getByTestId('canvas-stub')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /normalization/i })).toBeInTheDocument()
  })

  it('defaults the selector to match-height and updates the store on change', async () => {
    useImageSlotsStore.getState().setSlotImage('A', sampleImage)
    useImageSlotsStore.getState().setSlotImage('B', sampleImage)
    const user = userEvent.setup()

    render(<ComparisonView />)

    const select = screen.getByRole('combobox', { name: /normalization/i })
    expect(select).toHaveValue('match-height')

    await user.selectOptions(select, 'fit')

    expect(useLayoutModeStore.getState().mode).toBe('fit')
  })
})
