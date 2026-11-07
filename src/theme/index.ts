/**
 * PNGPay Design Token System
 * Three themes: Pacific Modern (default light), Premium Midnight (dark), Tropical Energy (vibrant)
 */

// ─── Brand Palette ────────────────────────────────────────────────────────────

export const palette = {
  // Pacific Modern primaries
  midnightNavy: '#101D35',
  navyDeep: '#0A1628',
  navyMid: '#1A2F52',
  navyLight: '#243D6B',
  pacificGreen: '#16C784',
  pacificGreenLight: '#1FE096',
  pacificGreenDark: '#0FA86E',
  islandMist: '#F5F7F2',
  sunriseGold: '#FFC857',
  sunriseGoldDark: '#E6B040',
  coralRed: '#F45B69',
  coralRedDark: '#D94555',
  pureWhite: '#FFFFFF',
  offWhite: '#F8FAF6',

  // Tropical Energy accents
  tropicalTurquoise: '#00C9B1',
  tropicalCoral: '#FF6B6B',
  tropicalSunshine: '#FFD93D',
  tropicalDeepBlue: '#1A1A6E',
  tropicalLavender: '#A78BFA',
  tropicalMango: '#FF9F43',

  // Neutrals
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Dark mode surfaces
  darkBackground: '#0B1120',
  darkSurface: '#17243A',
  darkCard: '#19283F',
  darkBorder: '#26364D',
  darkElevated: '#19283F',
};

// ─── Theme Definitions ────────────────────────────────────────────────────────

export type Theme = {
  id: 'pacific' | 'midnight' | 'tropical';
  name: string;
  isDark: boolean;
  colors: {
    // Brand
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    accentText: string;
    highlight: string;
    danger: string;
    dangerDark: string;
    // Backgrounds
    background: string;
    backgroundAlt: string;
    surface: string;
    surfaceElevated: string;
    card: string;
    inputBackground: string;
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textOnPrimary: string;
    textOnAccent: string;
    // Borders & dividers
    border: string;
    borderLight: string;
    divider: string;
    // Semantic
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    information: string;
    informationLight: string;
    // Overlay
    overlay: string;
    overlayLight: string;
    // Tab bar
    tabActive: string;
    tabInactive: string;
    tabBackground: string;
    tabBorder: string;
    // Header
    headerBackground: string;
    headerText: string;
    headerBorder: string;
    // Balance card specific
    balanceCardBg: string;
    balanceCardText: string;
    balanceAmountText: string;
    // Misc
    white: string;
    black: string;
    skeleton: string;
    skeletonHighlight: string;
  };
};

export const pacificTheme: Theme = {
  id: 'pacific',
  name: 'Pacific Modern',
  isDark: false,
  colors: {
    primary: palette.midnightNavy,
    primaryLight: palette.navyMid,
    primaryDark: palette.navyDeep,
    accent: palette.pacificGreen,
    accentLight: palette.pacificGreenLight,
    accentDark: palette.pacificGreenDark,
    accentText: '#087548',
    highlight: palette.sunriseGold,
    danger: '#B42336',
    dangerDark: palette.coralRedDark,
    background: palette.islandMist,
    backgroundAlt: palette.offWhite,
    surface: palette.pureWhite,
    surfaceElevated: palette.pureWhite,
    card: palette.pureWhite,
    inputBackground: palette.pureWhite,
    textPrimary: palette.gray900,
    textSecondary: palette.gray500,
    textMuted: palette.gray400,
    textOnPrimary: palette.pureWhite,
    textOnAccent: palette.midnightNavy,
    border: palette.gray200,
    borderLight: palette.gray100,
    divider: palette.gray100,
    success: '#087548',
    successLight: '#DCFCE7',
    warning: palette.sunriseGold,
    warningLight: '#FEF9C3',
    error: '#B42336',
    errorLight: '#FFE4E7',
    information: '#1D70B8',
    informationLight: '#E8F2FC',
    overlay: 'rgba(16,29,53,0.55)',
    overlayLight: 'rgba(16,29,53,0.08)',
    tabActive: '#087548',
    tabInactive: palette.gray400,
    tabBackground: palette.pureWhite,
    tabBorder: palette.gray200,
    headerBackground: palette.midnightNavy,
    headerText: palette.pureWhite,
    headerBorder: 'transparent',
    balanceCardBg: palette.midnightNavy,
    balanceCardText: 'rgba(255,255,255,0.7)',
    balanceAmountText: palette.pureWhite,
    white: palette.pureWhite,
    black: palette.gray900,
    skeleton: palette.gray200,
    skeletonHighlight: palette.gray100,
  },
};

export const midnightTheme: Theme = {
  id: 'midnight',
  name: 'Premium Midnight',
  isDark: true,
  colors: {
    primary: palette.midnightNavy,
    primaryLight: palette.darkSurface,
    primaryDark: palette.darkBackground,
    accent: palette.pacificGreen,
    accentLight: '#43D9A3',
    accentDark: palette.pacificGreenDark,
    accentText: palette.darkBackground,
    highlight: palette.sunriseGold,
    danger: palette.coralRed,
    dangerDark: palette.coralRedDark,
    background: palette.darkBackground,
    backgroundAlt: palette.midnightNavy,
    surface: palette.darkSurface,
    surfaceElevated: palette.darkElevated,
    card: palette.darkCard,
    inputBackground: '#142137',
    textPrimary: '#F5F7FA',
    textSecondary: '#B7C3D3',
    textMuted: '#8291A5',
    textOnPrimary: palette.pureWhite,
    textOnAccent: palette.darkBackground,
    border: palette.darkBorder,
    borderLight: '#223149',
    divider: '#223149',
    success: palette.pacificGreen,
    successLight: '#102A24',
    warning: palette.sunriseGold,
    warningLight: '#2A2415',
    error: palette.coralRed,
    errorLight: '#301D26',
    information: '#65B8F5',
    informationLight: '#142B40',
    overlay: 'rgba(0,0,0,0.7)',
    overlayLight: 'rgba(0,0,0,0.25)',
    tabActive: palette.pacificGreen,
    tabInactive: '#8291A5',
    tabBackground: palette.darkSurface,
    tabBorder: palette.darkBorder,
    headerBackground: palette.darkSurface,
    headerText: '#F5F7FA',
    headerBorder: palette.darkBorder,
    balanceCardBg: palette.darkCard,
    balanceCardText: '#B7C3D3',
    balanceAmountText: palette.pacificGreen,
    white: palette.pureWhite,
    black: palette.gray900,
    skeleton: '#1E2E4A',
    skeletonHighlight: '#253354',
  },
};

export const tropicalTheme: Theme = {
  id: 'tropical',
  name: 'Tropical Energy',
  isDark: false,
  colors: {
    primary: palette.tropicalDeepBlue,
    primaryLight: '#2A2A9E',
    primaryDark: '#0D0D5C',
    accent: palette.tropicalTurquoise,
    accentLight: '#33D4C0',
    accentDark: '#00A896',
    accentText: '#007F70',
    highlight: palette.tropicalSunshine,
    danger: '#C23D3D',
    dangerDark: '#E85555',
    background: '#F0FFFE',
    backgroundAlt: '#E8FFFE',
    surface: palette.pureWhite,
    surfaceElevated: palette.pureWhite,
    card: palette.pureWhite,
    inputBackground: '#F0FFFE',
    textPrimary: palette.gray900,
    textSecondary: palette.gray600,
    textMuted: palette.gray400,
    textOnPrimary: palette.pureWhite,
    textOnAccent: palette.tropicalDeepBlue,
    border: '#B2EBE6',
    borderLight: '#D4F5F2',
    divider: '#E0F7F5',
    success: '#007F70',
    successLight: '#CCFAF6',
    warning: palette.tropicalMango,
    warningLight: '#FFF0DC',
    error: '#C23D3D',
    errorLight: '#FFE4E4',
    information: '#1A76A8',
    informationLight: '#E2F3FC',
    overlay: 'rgba(26,26,110,0.5)',
    overlayLight: 'rgba(0,201,177,0.08)',
    tabActive: '#007F70',
    tabInactive: palette.gray400,
    tabBackground: palette.pureWhite,
    tabBorder: '#D4F5F2',
    headerBackground: palette.tropicalDeepBlue,
    headerText: palette.pureWhite,
    headerBorder: 'transparent',
    balanceCardBg: palette.tropicalDeepBlue,
    balanceCardText: 'rgba(255,255,255,0.7)',
    balanceAmountText: palette.tropicalSunshine,
    white: palette.pureWhite,
    black: palette.gray900,
    skeleton: '#D4F5F2',
    skeletonHighlight: '#E0F7F5',
  },
};

export const themes = { pacific: pacificTheme, midnight: midnightTheme, tropical: tropicalTheme };
export type ThemeId = keyof typeof themes;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

// Typography styles — color intentionally omitted so components inject theme color
export const type = {
  displayBold: { fontSize: fontSizes.display, fontWeight: fontWeights.extraBold, letterSpacing: -0.5 },
  h1: { fontSize: fontSizes.xxxl, fontWeight: fontWeights.bold, letterSpacing: -0.3 },
  h2: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, letterSpacing: -0.2 },
  h3: { fontSize: fontSizes.xl, fontWeight: fontWeights.semiBold },
  h4: { fontSize: fontSizes.lg, fontWeight: fontWeights.semiBold },
  bodyLarge: { fontSize: fontSizes.lg, fontWeight: fontWeights.regular },
  body: { fontSize: fontSizes.md, fontWeight: fontWeights.regular },
  bodySmall: { fontSize: fontSizes.sm, fontWeight: fontWeights.regular },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.semiBold, letterSpacing: 0.1 },
  labelLarge: { fontSize: fontSizes.md, fontWeight: fontWeights.semiBold },
  caption: { fontSize: fontSizes.xs, fontWeight: fontWeights.regular, letterSpacing: 0.2 },
  mono: { fontSize: fontSizes.sm, fontFamily: 'monospace' },
  amount: { fontSize: fontSizes.xxxl, fontWeight: fontWeights.bold, letterSpacing: -0.5 },
  amountLarge: { fontSize: fontSizes.display, fontWeight: fontWeights.extraBold, letterSpacing: -1 },
};

// Legacy alias kept so existing screens don't break
export const typography = {
  h1: { ...type.h1 },
  h2: { ...type.h2 },
  h3: { ...type.h3 },
  body: { ...type.body },
  bodySmall: { ...type.bodySmall },
  label: { ...type.label },
  caption: { ...type.caption },
};

// ─── Radius ───────────────────────────────────────────────────────────────────

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  none: {},
  sm: {
    shadowColor: '#101D35',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#101D35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#101D35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  }),
};

// Legacy alias
export const shadow = { card: shadows.md };

// ─── Legacy colors alias (keeps existing code working) ────────────────────────

export const colors = {
  primary: pacificTheme.colors.primary,
  primaryLight: pacificTheme.colors.primaryLight,
  accent: pacificTheme.colors.accent,
  background: pacificTheme.colors.background,
  surface: pacificTheme.colors.surface,
  border: pacificTheme.colors.border,
  textPrimary: pacificTheme.colors.textPrimary,
  textSecondary: pacificTheme.colors.textSecondary,
  textMuted: pacificTheme.colors.textMuted,
  success: pacificTheme.colors.success,
  error: pacificTheme.colors.error,
  warning: pacificTheme.colors.warning,
  white: pacificTheme.colors.white,
  black: pacificTheme.colors.black,
  overlay: pacificTheme.colors.overlay,
};
