import { BRAND_KEY_METRICS, BRAND_KEY_SHAPES, colors, TEST_IDS } from '@clavis-via/shared'

type BrandKeyProps = Readonly<{
  // Width in px.
  width: number
}>

const GRADIENT_FILL = `url(#${BRAND_KEY_METRICS.GRADIENT_ID})`

// The key from the approved mockup: three circles, a shaft and the bit.
export function BrandKey({ width }: BrandKeyProps) {
  const height = (width * BRAND_KEY_METRICS.VIEW_BOX_HEIGHT) / BRAND_KEY_METRICS.VIEW_BOX_WIDTH

  return (
    <svg
      data-testid={TEST_IDS.BRAND_KEY}
      width={width}
      height={height}
      viewBox={`0 0 ${BRAND_KEY_METRICS.VIEW_BOX_WIDTH} ${BRAND_KEY_METRICS.VIEW_BOX_HEIGHT}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={BRAND_KEY_METRICS.GRADIENT_ID}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={BRAND_KEY_METRICS.GRADIENT_START_Y}
          x2={0}
          y2={BRAND_KEY_METRICS.GRADIENT_END_Y}
        >
          {colors.keyGradient.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>
      {BRAND_KEY_SHAPES.CIRCLES.map((circle) => (
        <circle
          key={circle.cx}
          cx={circle.cx}
          cy={circle.cy}
          r={circle.r}
          fill="none"
          stroke={GRADIENT_FILL}
          strokeWidth={BRAND_KEY_METRICS.CIRCLE_STROKE_WIDTH}
        />
      ))}
      <rect
        x={BRAND_KEY_SHAPES.SHAFT.x}
        y={BRAND_KEY_SHAPES.SHAFT.y}
        width={BRAND_KEY_SHAPES.SHAFT.width}
        height={BRAND_KEY_SHAPES.SHAFT.height}
        rx={BRAND_KEY_SHAPES.SHAFT.rx}
        fill={GRADIENT_FILL}
      />
      <path d={BRAND_KEY_SHAPES.BIT_PATH} fill={GRADIENT_FILL} />
    </svg>
  )
}
