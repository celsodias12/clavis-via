import { screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { AuthenticationFields } from './authentication-fields.component'

describe('AuthenticationFields', () => {
  it('renders its children', async () => {
    await renderWithProviders(
      <AuthenticationFields firstLabelBaseline={218}>
        <Text>campos</Text>
      </AuthenticationFields>,
    )
    expect(screen.getByText('campos')).toBeTruthy()
  })
})
