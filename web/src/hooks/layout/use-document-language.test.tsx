import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { i18n } from '../../configs/i18n.config'
import { useDocumentLanguage } from './use-document-language'

describe('useDocumentLanguage', () => {
  it('writes the language on <html> and follows a change', async () => {
    renderHook(() => useDocumentLanguage())
    expect(document.documentElement.lang).toBe('pt-BR')

    await act(() => i18n.changeLanguage('es'))
    expect(document.documentElement.lang).toBe('es')

    await act(() => i18n.changeLanguage('pt-BR'))
  })
})
