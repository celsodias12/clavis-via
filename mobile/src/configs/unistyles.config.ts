import { StyleSheet } from 'react-native-unistyles'
import '../styles/themes/types'
import { themes } from '../styles/themes'

StyleSheet.configure({
  themes,
  settings: {
    initialTheme: 'light',
  },
})
