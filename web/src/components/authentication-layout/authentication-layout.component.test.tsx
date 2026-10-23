import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { ROUTES } from '../../constants/route.constant'
import { AuthenticationLayout } from './authentication-layout.component'

function layout(overrides: Partial<Parameters<typeof AuthenticationLayout>[0]> = {}) {
  return (
    <AuthenticationLayout
      title={'Entrar na\nsua conta'}
      subtitle="Subtítulo"
      submitLabel="Entrar"
      onSubmit={vi.fn()}
      isSubmitting={false}
      footerQuestion="Sem conta?"
      footerActionLabel="Criar"
      footerRoute={ROUTES.SIGN_UP}
      {...overrides}
    >
      <p>campos</p>
    </AuthenticationLayout>
  )
}

describe.each([
  ['a phone', 390, TEST_IDS.WAVE_BACKGROUND_FADE, 'Entrar nasua conta'],
  ['a wide screen', 1280, TEST_IDS.WELCOME_BRAND, 'Entrar na sua conta'],
])('AuthenticationLayout on %s', (_name, width, layoutMarker, headingName) => {
  it('renders its layout, fields, form error and submit button', async () => {
    setViewportWidth(width)
    const onSubmit = vi.fn()
    await renderWithProviders(layout({ onSubmit, formErrorMessage: 'Falhou' }))

    expect(screen.getByTestId(layoutMarker)).toBeTruthy()
    expect(screen.getByRole('heading', { name: headingName })).toBeTruthy()
    expect(screen.getByText('Subtítulo')).toBeTruthy()
    expect(screen.getByText('campos')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR).textContent).toBe('Falhou')

    fireEvent.click(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows no form error by default and links to the other screen', async () => {
    setViewportWidth(width)
    const { router } = await renderWithProviders(layout())

    expect(screen.queryByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeNull()
    fireEvent.click(screen.getByText('Criar'))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.SIGN_UP))
  })
})
