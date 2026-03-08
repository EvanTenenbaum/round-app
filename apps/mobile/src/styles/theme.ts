// Round Design System
// Warm, home-cooked, community feel

export const Colors = {
  // Primary palette
  orange: '#E8733A',
  orangeLight: '#F2956B',
  orangeDark: '#C55A25',

  // Neutrals
  cream: '#FDF6EC',
  creamLight: '#FFF9F3',
  creamDark: '#F5E8D4',

  brown: '#3D2314',
  brownLight: '#7A5A48',
  brownLighter: '#B08070',

  // Accent
  green: '#4A7C59',
  greenLight: '#6BA37A',

  // System
  white: '#FFFFFF',
  error: '#D94F3D',
  warning: '#E8A93A',
  success: '#4A7C59',

  // Gray scale
  gray50: '#FAFAFA',
  gray100: '#F7F5F3',
  gray200: '#EDE8E3',
  gray300: '#D9D0C8',
  gray400: '#BFB3A8',
  gray500: '#9E9088',
  gray600: '#6E625A',
  gray700: '#4A4040',
  gray800: '#2E2828',
  gray900: '#1A1614',

  // Semantic
  amber: '#D97706',
}

export const Typography = {
  // Font families — using system fonts; swap to Inter via expo-font if desired
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 34,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
}

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
}

export const Shadows = {
  sm: {
    shadowColor: Colors.brown,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.brown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
}

// Common component styles
export const CommonStyles = {
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: Typography.sizes.base,
    color: Colors.brown,
  },
  primaryButton: {
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.brown,
    marginBottom: Spacing.xs,
  },
}
