// Classes and metrics of the Conversa screen. A chat page: a header, a message column that scrolls on its own and
// the composer at the bottom of that column, all of it 720 px wide at most and centered in the content area.
export const CONVERSATION_CLASSES = Object.freeze({
  // As tall as the window (minus the bottom tabs on a phone) so only the message column scrolls.
  SCREEN: 'flex h-[calc(100svh-6rem)] flex-col md:h-svh',
  HEADER:
    'mx-auto flex w-full max-w-[720px] items-center justify-between px-4 pt-5 pb-3 md:px-10 md:pt-8',
  TITLE: 'm-0 font-title text-[28px] font-medium text-home-heading md:text-[34px]',
  HISTORY:
    'h-10 cursor-pointer rounded-full border-0 bg-pill-background px-5 font-body text-base text-home-brand-text transition-colors hover:bg-pill-background/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent',
  LIST: 'min-h-0 flex-1 overflow-y-auto',
  LIST_CONTENT: 'mx-auto flex w-full max-w-[720px] flex-col gap-3 px-4 pt-4 pb-4 md:gap-4 md:px-10',
  PANEL:
    'rounded-2xl bg-chat-panel px-4 pt-4 pb-3 shadow-[0_1px_6px_var(--color-plan-card-shadow)] md:px-6 md:pt-5 md:pb-4',
  PANEL_ROW: 'flex items-start gap-3',
  ICON: 'size-10 shrink-0 md:size-11',
  GREETING: 'min-w-0 flex-1',
  TIME: 'm-0 mt-2 pl-14 font-body text-sm text-chat-time md:pl-[56px]',
  MESSAGES: 'flex flex-col gap-3 md:gap-4',
  QUICK_REPLIES: 'flex flex-wrap gap-2.5',
  FOOTER: 'mx-auto w-full max-w-[720px] px-4 pt-2 pb-3 md:px-10 md:pb-6',
  FEEDBACK: 'mb-3 flex flex-col items-center gap-3',
  FEEDBACK_TEXT: 'm-0 block text-center font-body text-base text-error',
  NOTICE: 'mt-3 flex flex-col gap-0.5',
  NOTICE_TEXT:
    'm-0 whitespace-pre-line text-center font-body text-xs leading-relaxed text-chat-notice',
  SKELETON: 'h-12 w-48 rounded-2xl',
})

export const CHAT_BUBBLE_CLASSES = Object.freeze({
  BASE: 'm-0 w-fit max-w-[88%] rounded-2xl px-4 py-3 font-body text-base leading-relaxed break-words whitespace-pre-wrap md:max-w-[80%] md:text-[17px]',
  FULL_WIDTH: 'w-full max-w-full',
  ASSISTANT: 'self-start bg-chat-bubble-assistant text-chat-bubble-assistant-text',
  USER: 'self-end bg-primary-accent text-white',
})

export const QUICK_REPLY_CLASSES = Object.freeze({
  PILL: 'h-11 cursor-pointer rounded-full border-0 bg-pill-background px-5 font-body text-base text-chat-quick-reply-text transition-colors hover:bg-pill-background/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent disabled:cursor-default disabled:opacity-55',
})

export const CHAT_INPUT_CLASSES = Object.freeze({
  ROW: 'flex items-end gap-3',
  FIELD:
    'max-h-40 min-h-12 flex-1 resize-none rounded-3xl border-chat-input-border bg-chat-input-background px-5 py-3 font-body text-base leading-snug text-title shadow-none placeholder:text-chat-input-placeholder focus-visible:border-primary-accent focus-visible:ring-0 md:text-[17px]',
  SEND: 'flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-chat-send-background p-0 text-white transition-opacity hover:bg-chat-send-background/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent disabled:cursor-default disabled:opacity-55',
  SPINNER: 'size-5 animate-spin',
  ARROW_SIZE: 22,
})
