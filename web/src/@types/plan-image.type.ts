// An image the browser can pick a file of: the default source and the candidates with their widths in px.
export type WebImageSource = Readonly<{
  src: string
  srcSet?: string
}>

export type PlanImageSources = Readonly<{
  thumbnail: WebImageSource
  cover: WebImageSource
}>
