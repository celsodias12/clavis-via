import { useRouter } from '@tanstack/react-router'

// Goes to the previous page of the app; a direct visit has none (back would leave the site), so it runs the
// fallback instead.
export function useGoBack(fallback: () => unknown): () => unknown {
  const router = useRouter()

  return () => (router.history.canGoBack() ? router.history.back() : fallback())
}
