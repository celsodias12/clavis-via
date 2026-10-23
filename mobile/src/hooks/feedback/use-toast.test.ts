import { renderHook } from '@testing-library/react-native'
import { ToastAndroid } from 'react-native'
import { useToast } from './use-toast'

describe('useToast', () => {
  it('shows the message as a short native toast', async () => {
    const show = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})
    const { result } = await renderHook(() => useToast())
    result.current('Dia concluído.')
    expect(show).toHaveBeenCalledWith('Dia concluído.', ToastAndroid.SHORT)
    show.mockRestore()
  })
})
