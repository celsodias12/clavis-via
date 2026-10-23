import type { ptBr } from './locales'

// Bounds the recursion below so the compiler never tries to go deeper than this.
// A recursive template-literal type that calls itself without a depth limit hits
// TypeScript's "Type instantiation is excessively deep" check (TS2589) under
// strictNullChecks, even for shallow objects. Ten levels is far beyond anything a
// translation key tree needs.
type RemainingDepth = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// Recursively flatten nested locale keys into dot-notation (e.g. "screen.login.submit").
type RecursiveKeyOf<TObject extends Record<string, unknown>, TDepth extends number = 9> = [
  TDepth,
] extends [never]
  ? never
  : {
      [TKey in string & keyof TObject]: TObject[TKey] extends Record<string, unknown>
        ? `${TKey}.${RecursiveKeyOf<TObject[TKey], RemainingDepth[TDepth]>}`
        : `${TKey}`
    }[string & keyof TObject]

type DefaultLocale = typeof ptBr

export type TranslationKeys = RecursiveKeyOf<DefaultLocale>
