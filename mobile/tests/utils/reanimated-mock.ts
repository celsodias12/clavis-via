// The native Reanimated runtime does not exist under jest. A test file that renders a Skeleton registers
//   jest.mock('react-native-reanimated', () => require('<relative>/tests/utils/reanimated-mock').reanimatedModule)
// Timing helpers return their target value and animated styles are plain styles.
export const reanimatedModule = {
  __esModule: true,
  default: { View: require('react-native').View },
  useSharedValue: (initialValue: number) => {
    let current = initialValue
    return {
      get: () => current,
      set: (next: number) => {
        current = next
      },
    }
  },
  useAnimatedStyle: (factory: () => object) => factory(),
  withRepeat: (animation: number) => animation,
  withTiming: (target: number) => target,
}
