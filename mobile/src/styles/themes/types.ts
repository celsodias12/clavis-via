import type { themes } from './index'

type AppThemes = typeof themes

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}
