// Subscribes to "the app came back to the foreground" and returns the function that unsubscribes.
export type SubscribeToForeground = (onForeground: () => void) => () => void

export type TimeContextData = Readonly<{
  subscribeToForeground: SubscribeToForeground
}>
