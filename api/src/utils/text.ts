// Fills the {{name}} placeholders of a template with the given values.
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => String(values[name]))
}

// Lowercase, without accents or punctuation (hyphens become spaces) and with single spaces,
// so the text can be searched for plain terms.
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Mark}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
