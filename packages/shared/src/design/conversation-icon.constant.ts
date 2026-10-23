// Drawn parts of the Conversa screen, shared by the app and the web (each in a 24 unit view box).
export const CONVERSATION_ICONS = Object.freeze({
  // The round icon of the assistant: a person inside a ring.
  ASSISTANT: Object.freeze({
    VIEW_BOX_SIZE: 24,
    HEAD_CENTER_Y: 9.5,
    HEAD_RADIUS: 3.4,
    BODY_PATH: 'M6.2 18.2 C6.8 14.6 9.2 13 12 13 C14.8 13 17.2 14.6 17.8 18.2',
    STROKE_WIDTH: 1.6,
  }),
  // The arrow of the send button.
  SEND_ARROW: Object.freeze({
    VIEW_BOX_SIZE: 24,
    PATH: 'M12 19 V6 M6.5 11.5 L12 6 L17.5 11.5',
    STROKE_WIDTH: 2.4,
  }),
})
