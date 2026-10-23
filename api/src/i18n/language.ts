export type ContentLanguage = 'pt-BR' | 'en' | 'es'

const DEFAULT_LANGUAGE: ContentLanguage = 'pt-BR'

function supportedLanguage(tag: string): ContentLanguage | null {
  const primary = tag.trim().toLowerCase().split('-')[0]
  if (primary === 'pt') return 'pt-BR'
  if (primary === 'en' || primary === 'es') return primary
  return null
}

// Accept-Language may contain several preferences and q weights. Honor the highest supported one.
export function resolveRequestLanguage(header: string | null): ContentLanguage {
  if (!header) return DEFAULT_LANGUAGE

  const preferences = header.split(',').map((entry, index) => {
    const [tag, ...parameters] = entry.split(';')
    const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='))
    const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1
    return { tag, quality: Number.isFinite(quality) ? quality : 0, index }
  })

  preferences.sort((a, b) => b.quality - a.quality || a.index - b.index)
  for (const { tag, quality } of preferences) {
    if (quality <= 0 || quality > 1) continue
    const language = supportedLanguage(tag)
    if (language) return language
  }
  return DEFAULT_LANGUAGE
}
