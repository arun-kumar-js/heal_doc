// Font configuration for Poppins fonts
export const Fonts = {
  // Poppins font weights
  PoppinsRegular: 'Poppins-Regular',
  PoppinsBold: 'Poppins-Bold',
  PoppinsMedium: 'Poppins-Medium',
  PoppinsSemiBold: 'Poppins-SemiBold',
  PoppinsLight: 'Poppins-Light',
  PoppinsThin: 'Poppins-Thin',
  PoppinsExtraLight: 'Poppins-ExtraLight',
  PoppinsExtraBold: 'Poppins-ExtraBold',
  PoppinsBlack: 'Poppins-Black',
  PoppinsItalic: 'Poppins-Italic',
  PoppinsBoldItalic: 'Poppins-BoldItalic',
  PoppinsMediumItalic: 'Poppins-MediumItalic',
  PoppinsSemiBoldItalic: 'Poppins-SemiBoldItalic',
  PoppinsLightItalic: 'Poppins-LightItalic',
  PoppinsThinItalic: 'Poppins-ThinItalic',
  PoppinsExtraLightItalic: 'Poppins-ExtraLightItalic',
  PoppinsExtraBoldItalic: 'Poppins-ExtraBoldItalic',
  PoppinsBlackItalic: 'Poppins-BlackItalic',
};

// Font sizes
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  xxxxl: 32,
};

// Font styles for common use cases
export const FontStyles = {
  heading: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: FontSizes.xxl,
  },
  subheading: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: FontSizes.lg,
  },
  body: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: FontSizes.md,
  },
  caption: {
    fontFamily: Fonts.PoppinsLight,
    fontSize: FontSizes.sm,
  },
  button: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: FontSizes.md,
  },
};

// Export PoppinsFonts for backward compatibility
export const PoppinsFonts = Fonts;
