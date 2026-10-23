import { globalStyles } from './global'

describe('globalStyles', () => {
  it('exposes the full-screen style', () => {
    expect(globalStyles.screen).toEqual({ flex: 1 })
  })
})
