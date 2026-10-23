// One line of a multi-line translation, with a key that stays stable for the lifetime of the text.
export type TextLine = Readonly<{ id: string; position: number; content: string }>
