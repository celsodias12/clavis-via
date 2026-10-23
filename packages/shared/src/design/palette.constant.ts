export const fonts = {
  brand: 'Jost_300Light',
  title: 'Petrona_400Regular',
  titleMedium: 'Petrona_500Medium',
  body: 'SourceSans3_400Regular',
  bodyMedium: 'SourceSans3_500Medium',
  bodySemiBold: 'SourceSans3_600SemiBold',
} as const

export const colors = {
  brand: '#23345e',
  title: '#1e2340',
  body: '#4b5060',
  link: '#36426e',
  linkStrong: '#264b91',
  navy: '#264c94',
  // Measured on the Check-in reference ("Continuar" button, flat fill).
  primaryLight: '#6aa2f6',
  // Measured: mean of the top 3 rows of the welcome background image.
  waveTop: '#f5f2fc',
  // Measured on the Check-in reference: the page fades from `checkInBackgroundTop` to `checkInBackgroundBottom`.
  checkInBackgroundTop: '#fbfbfe',
  checkInBackgroundBottom: '#f7f8fd',
  // Choice of the implementer (the design shows no selection): navy at 60%.
  tileSelectedBorder: 'rgba(38,76,148,0.6)',
  // Measured on the Check-in reference: flat tile fill, face fill (sparkle fill for Esperançosa) and the ink
  // of the eyes, brows and mouth, per emotion. Outro has no face, only dark dots on its tile.
  emotions: {
    heavy: { tile: '#e7edfd', fill: '#bcd8fd', ink: '#0f2c94' },
    anxious: { tile: '#fef5e3', fill: '#fde4ae', ink: '#241209' },
    discouraged: { tile: '#ebe9fd', fill: '#e1d3fd', ink: '#1a1040' },
    irritated: { tile: '#fde6ec', fill: '#fcc2d6', ink: '#3b0f27' },
    sensitive: { tile: '#fbe5f6', fill: '#fbc8ec', ink: '#35102f' },
    atPeace: { tile: '#e2f2fe', fill: '#cdebfd', ink: '#12308f' },
    hopeful: { tile: '#e7e6fd', fill: '#b498fa', ink: '#d3ccf0' },
    other: { tile: '#f2f2f7', fill: 'transparent', ink: '#14152b' },
  },
  // Measured on the Início reference: the "Ver prática de hoje" button fill.
  primaryAccent: '#6894f3',
  // Measured on the Início reference (top part): page background, the darker heading ink of the greeting and
  // card title, the header brand text, the card label, and the avatar placeholder.
  homeBackground: '#fafbff',
  homeHeading: '#05071c',
  homeBrandText: '#4a5688',
  homeCardLabel: '#4a5272',
  avatarBackground: '#dfe6fb',
  avatarInitial: '#264c94',
  // The "Sua chave de hoje" card fades from pink (bottom left) to periwinkle (top right) along 45 degrees.
  dailyKeyCardGradient: [
    { color: '#fdf0f2', offset: 0 },
    { color: '#f5f0f9', offset: 0.25 },
    { color: '#eff2fb', offset: 0.42 },
    { color: '#ecf0fc', offset: 0.6 },
    { color: '#ebecfe', offset: 0.8 },
    { color: '#e4e9fd', offset: 1 },
  ],
  // The patches of color over the gradient of the "Sua chave de hoje" card, each as the color at its center and
  // the same color fully transparent (where it fades out).
  dailyKeyCardBlobs: [
    { color: 'rgba(222,226,250,0.7)', fadeColor: 'rgba(222,226,250,0)' },
    { color: 'rgba(255,255,255,0.45)', fadeColor: 'rgba(255,255,255,0)' },
  ],
  // Measured on the Início and Planos references: tab bar fill, the line above it, the active ink and
  // the inactive icon and label inks, and the fill of the "Histórico" pill.
  // Measured on the Início reference (bottom part): the fill and shadow of its cards, the tile and the ink of
  // the book, and the progress bar of the current plan.
  homeCardBackground: '#fcfcfe',
  homeCardShadow: 'rgba(36,44,92,0.07)',
  dailyKeyCardShadow: 'rgba(36,44,92,0.08)',
  verseTile: '#e3ebfd',
  verseBook: '#4d78d8',
  homeChevron: '#5f5f67',
  homeProgressTrack: '#eceffb',
  homeProgressFill: '#9bc0fd',
  tabBarBackground: '#fcfcfd',
  tabBarSeparator: '#eeeff5',
  tabBarActive: '#4f7be0',
  tabBarInactiveIcon: '#5c5f72',
  tabBarInactiveLabel: '#8a8d9b',
  pillBackground: '#eef1fb',
  // Soft shadow of the plan cards on the Planos screen.
  planCardShadow: 'rgba(36,44,92,0.07)',
  // Measured on the Plano reference: the sheet under the cover, the accent of the selected segment, the
  // number circle of a day, the calendar icon and the pill behind the selected segment.
  planSheetBackground: '#f8f8fc',
  planAccent: '#3e54a8',
  planDayCircle: '#dde5fb',
  planSegmentPill: '#e0e8fc',
  planCalendarIcon: '#a86f82',
  // Measured on the Dia reference: outline of the selected segment, fill of the "Anterior" button and the
  // translucent disc behind the play button of the video.
  dayChipOutline: '#b4c0e6',
  dayPreviousButton: '#eaedfa',
  dayVideoPlayFill: 'rgba(60,30,50,0.16)',
  // Measured on the Ação do dia reference: the action card, its check disc, the tip card with its text and
  // icon inks, and the soft box of the reflection field (which shows the page through it).
  dayActionCard: '#fcfcfc',
  dayActionCheck: '#88c5b9',
  dayTipCard: '#e9f0fd',
  dayTipText: '#36405a',
  dayTipIcon: '#6a78b2',
  reflectionFieldBorder: '#eeeef0',
  reflectionFieldBackground: 'transparent',
  // Measured on the Prática de hoje reference: the page, the inks of the subtitle and the description, the
  // wind icon and its circle, the play disc (top and bottom of its gradient) and ring, the progress bar
  // (track, fill, knob), the time labels and the two waves at the bottom.
  practiceBackground: '#f9f9fb',
  practiceSubtitle: '#40444f',
  practiceDescription: '#31353f',
  practiceIcon: '#4d68b8',
  practiceIconCircle: '#e1e9fc',
  practicePlayTop: '#c5d3fd',
  practicePlayBottom: '#97b2fa',
  practicePlayRing: 'rgba(255,255,255,0.92)',
  practiceTrack: '#e7e7f1',
  practiceFill: '#b1bfff',
  practiceKnob: '#6f9ff5',
  practiceLabel: '#9c9da6',
  practiceWaveBlue: '#e6edfd',
  practiceWavePink: '#f3e7f9',
  // Measured on the Perfil reference: the "Meu propósito" card and the soft square behind its icon, the inks
  // of the menu icons and arrows, and the line between menu items.
  profileCard: '#fafafc',
  profileSquare: '#eaeffd',
  profileRowIcon: '#4b4e5c',
  profileChevron: '#a3a3a8',
  profileDivider: '#eeeff5',
  // Measured on the Minhas emoções reference: the selected period segment, the chart (line, dots and the
  // gradient under the line) and the circle and ink of each insight icon.
  emotionsSegmentSolid: '#7299f7',
  emotionsChartLine: '#9fb0e6',
  emotionsChartPoint: '#a6b9fb',
  emotionsAreaTop: '#dde4fc',
  emotionsAreaBottom: '#f7f7fd',
  insightBalancedCircle: '#e6f5f0',
  insightBalancedInk: '#4a9a85',
  insightAnxietyCircle: '#e5e1fb',
  insightAnxietyFill: '#cfc9f8',
  insightAnxietyInk: '#3a2fcf',
  insightRoutineCircle: '#fbefdb',
  insightRoutineFill: '#fde3b8',
  insightRoutineInk: '#8a4516',
  // Measured on the Minha jornada reference: the streak card (a pink card with a periwinkle top right corner), its
  // calendar icon, the days without check-in, the phrase card tile, the achievement icons and the "Ver todas" link.
  journeyStreakGradient: [
    { color: '#faeefa', offset: 0 },
    { color: '#f9f1fc', offset: 0.55 },
    { color: '#ebedfe', offset: 1 },
  ],
  journeyCalendarIcon: '#b08aac',
  journeyDayEmptyRing: '#e8dde3',
  journeyDayLabel: '#6a6c80',
  journeyPhraseTileGradient: [
    { color: '#fdf2f7', offset: 0 },
    { color: '#e6ecfc', offset: 1 },
  ],
  journeyAchievementIcon: '#6f86d6',
  journeyAchievementLabel: '#555a6e',
  journeyAchievementChevron: '#3c3e4a',
  journeyLink: '#4a62b8',
  // Measured on the Conversa reference: the white panel of the greeting, the bubble of the assistant and its ink
  // (the design blurs the text, so the ink is the app title ink), the ink of the quick replies, the field of the
  // message with its border and placeholder, the send button, the time and the notice under the field.
  chatPanel: '#fefefe',
  chatBubbleAssistant: '#f7f7f9',
  chatBubbleAssistantText: '#2b2e3a',
  chatIcon: '#7d9ef8',
  chatIconInk: '#eef3ff',
  chatQuickReplyText: '#3a4673',
  chatInputBackground: '#fafbfd',
  chatInputBorder: '#ecedf3',
  chatInputPlaceholder: '#b7b7c0',
  chatSendBackground: '#6f99f7',
  chatTime: '#a7a9af',
  chatNotice: '#9e9fa6',
  fieldBorder: '#e1e3ef',
  fieldBackground: 'rgba(255,255,255,0.94)',
  placeholder: '#9aa0b5',
  white: '#ffffff',
  // The design has no error state; this red is a deliberate choice.
  error: '#b3261e',
  keyGradient: [
    { color: '#93bcf2', offset: 0 },
    { color: '#a5b3ef', offset: 0.3 },
    { color: '#ad9fec', offset: 0.6 },
    { color: '#ab9cea', offset: 1 },
  ],
  buttonShadow: 'rgba(38,75,145,0.22)',
} as const
