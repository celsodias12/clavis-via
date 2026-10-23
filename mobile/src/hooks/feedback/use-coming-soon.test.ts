import { renderHook } from '@testing-library/react-native'
import { ToastAndroid } from 'react-native'
import { useComingSoon } from './use-coming-soon'

describe('useComingSoon', () => {
  it('shows the translated coming soon toast', async () => {
    const show = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})
    const { result } = await renderHook(() => useComingSoon())
    result.current()
    expect(show).toHaveBeenCalledWith('Em breve', ToastAndroid.SHORT)
    show.mockRestore()
  })
})
