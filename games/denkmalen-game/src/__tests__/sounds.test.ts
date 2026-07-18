import { sounds } from '@/lib/sounds'

describe('SoundManager', () => {
  beforeEach(() => {
    sounds.setEnabled(true)
    sounds.setVolume(0.5)
  })

  it('has setEnabled method', () => {
    expect(typeof sounds.setEnabled).toBe('function')
  })

  it('has setVolume method', () => {
    expect(typeof sounds.setVolume).toBe('function')
  })

  it('has isEnabled method', () => {
    expect(typeof sounds.isEnabled).toBe('function')
  })

  it('defaults to enabled', () => {
    expect(sounds.isEnabled()).toBe(true)
  })

  it('can be disabled', () => {
    sounds.setEnabled(false)
    expect(sounds.isEnabled()).toBe(false)
  })

  it('can be enabled', () => {
    sounds.setEnabled(false)
    sounds.setEnabled(true)
    expect(sounds.isEnabled()).toBe(true)
  })

  it('has click method', () => {
    expect(typeof sounds.click).toBe('function')
  })

  it('has success method', () => {
    expect(typeof sounds.success).toBe('function')
  })

  it('has error method', () => {
    expect(typeof sounds.error).toBe('function')
  })

  it('has draw method', () => {
    expect(typeof sounds.draw).toBe('function')
  })

  it('has timerWarning method', () => {
    expect(typeof sounds.timerWarning).toBe('function')
  })

  it('has timerUp method', () => {
    expect(typeof sounds.timerUp).toBe('function')
  })

  it('has vote method', () => {
    expect(typeof sounds.vote).toBe('function')
  })

  it('has celebrate method', () => {
    expect(typeof sounds.celebrate).toBe('function')
  })

  it('has transition method', () => {
    expect(typeof sounds.transition).toBe('function')
  })

  it('does not throw when playing sounds', () => {
    expect(() => {
      sounds.click()
      sounds.success()
      sounds.error()
      sounds.draw()
      sounds.timerWarning()
      sounds.timerUp()
      sounds.vote()
      sounds.celebrate()
      sounds.transition()
    }).not.toThrow()
  })

  it('does not throw when disabled', () => {
    sounds.setEnabled(false)
    expect(() => {
      sounds.click()
      sounds.success()
      sounds.error()
    }).not.toThrow()
  })
})