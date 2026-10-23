import { LINE_SEPARATOR, splitLines } from '@clavis-via/shared'
import type { CSSProperties, ElementType } from 'react'

type TextLinesProps = Readonly<{
  // Text that may hold several lines separated by "\n"; each line is its own block.
  text: string
  as?: ElementType
  className?: string
  style?: CSSProperties
  lineClassName?: string
  lineStyle?: CSSProperties
  // Wide screens: the hard line breaks of the copy become spaces and the text flows with its container.
  isFlowing?: boolean
}>

// Text whose line breaks come from the translation, so each line sits where the design puts it.
export function TextLines({
  text,
  as: Element = 'p',
  className,
  style,
  lineClassName,
  lineStyle,
  isFlowing = false,
}: TextLinesProps) {
  if (isFlowing) {
    return (
      <Element className={className} style={style}>
        {text.replaceAll(LINE_SEPARATOR, ' ')}
      </Element>
    )
  }

  return (
    <Element className={className} style={style}>
      {splitLines(text).map((line) => (
        <span key={line.id} className={lineClassName} style={lineStyle}>
          {line.content}
        </span>
      ))}
    </Element>
  )
}
