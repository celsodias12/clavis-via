const expoPreset = require('jest-expo/jest-preset')

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: '<rootDir>/tests/utils/test-environment.js',
  // MSW dependencies ship .mjs files, which the preset does not transform; reuse its Babel setup for them.
  transform: { '\\.mjs$': expoPreset.transform['\\.[jt]sx?$'] },
  // MSW 3 and its dependencies ship ESM only, so Babel has to transform them like the React Native packages.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|msw|@msw|@mswjs|until-async|rettime|outvariant|headers-polyfill|is-node-process|strict-event-emitter|@open-draft|@bundled-es-modules|cookie))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
  setupFiles: [
    'react-native-unistyles/mocks',
    '<rootDir>/tests/utils/jest-environment.ts',
    '<rootDir>/src/configs/unistyles.config.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/utils/jest-setup.ts'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/@types/**'],
  coverageReporters: ['text', 'json-summary', 'lcov'],
  coverageThreshold: {
    global: { statements: 100, branches: 100, functions: 100, lines: 100 },
  },
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
}
