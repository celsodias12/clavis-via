import { SHELL_METRICS } from '../../constants/layout.constant'
import { BrandKey } from '../brand-key/brand-key.component'

// The key centered on the screen background: shown while the session or the first screen data loads.
export function BrandSplash() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-home-background">
      <BrandKey width={SHELL_METRICS.SPLASH_KEY_WIDTH} />
    </div>
  )
}
