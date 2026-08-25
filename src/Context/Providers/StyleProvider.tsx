import React, {PropsWithChildren, useMemo} from 'react';
import {Platform, StyleSheet} from 'react-native';

import {StyleContext} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {isAndroid, isIOS} from '#src/Libraries/Platform/Detection';
import {type AppTheme} from '#src/Styles/Theme';

export const styleDefaults = {
  marginSize: 20,
  iconSize: 25,
  // iconSizeSmall used to be 20 but I feel that most of the time I use that it's when it's in-line
  // with text so I'm making this be the same as the fontSize eblow.
  iconSizeSmall: 16,
  // Minimum tappable control size (Apple HIG 44pt). Use as layout bounds, not hitSlop,
  // when the control is nested inside another pressable.
  minTouchTarget: 44,
  avatarSize: 36,
  avatarSizeSmall: 24, // 2/3rds.
  headerImageSize: 216,
  fontSize: 16, // This is copied from styles/Theme.
  // Arbitrary point at which things happen when scrolling a list.
  // Things such as displaying a back-to-top button.
  // 450 was originally roughly 8 messages @ 56 units per message.
  listScrollThreshold: 450,
  // Used for square crops in User Avatar and Photostream
  imageSquareCropDimension: 2048,
  overScrollHeight: 100, // marginSize * 5
};

export type StyleDefaults = typeof styleDefaults;

export const createCommonStyles = (theme: AppTheme) =>
  StyleSheet.create({
    margin: {
      margin: styleDefaults.marginSize,
    },
    marginHorizontal: {
      marginHorizontal: styleDefaults.marginSize,
    },
    overscroll: {
      marginBottom: styleDefaults.overScrollHeight,
    },
    displayNone: {
      display: 'none',
    },
    displayFlex: {
      display: 'flex',
    },
    flex0: {
      flex: 0,
    },
    flex: {
      flex: 1,
    },
    flex2: {
      flex: 2,
    },
    // https://stackoverflow.com/questions/45503294/space-between-components-in-react-native-styling
    gap: {
      gap: styleDefaults.marginSize,
    },
    gapSmall: {
      gap: styleDefaults.marginSize / 2,
    },
    flexRow: {
      flexDirection: 'row',
    },
    flexColumn: {
      flexDirection: 'column',
    },
    flexStart: {
      alignSelf: 'flex-start',
    },
    flexEnd: {
      alignSelf: 'flex-end',
    },
    flexWrap: {
      flexWrap: 'wrap',
    },
    marginTop: {
      marginTop: styleDefaults.marginSize,
    },
    marginBottom: {
      marginBottom: styleDefaults.marginSize,
    },
    marginNotTop: {
      marginLeft: styleDefaults.marginSize,
      marginRight: styleDefaults.marginSize,
      marginBottom: styleDefaults.marginSize,
    },
    marginLeft: {
      marginLeft: styleDefaults.marginSize,
    },
    marginRight: {
      marginRight: styleDefaults.marginSize,
    },
    marginRightBig: {
      marginRight: styleDefaults.marginSize * 1.5,
    },
    marginVertical: {
      marginVertical: styleDefaults.marginSize,
    },
    marginVerticalSmall: {
      marginVertical: styleDefaults.marginSize / 2,
    },
    marginHorizontalSmall: {
      marginHorizontal: styleDefaults.marginSize / 2,
    },
    marginLeftSmall: {
      marginLeft: styleDefaults.marginSize / 2,
    },
    marginRightSmall: {
      marginRight: styleDefaults.marginSize / 2,
    },
    booleanSettingRowView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    justifyContentStart: {
      justifyContent: 'flex-start',
    },
    justifyContentEnd: {
      justifyContent: 'flex-end',
    },
    alignItemsCenter: {
      alignItems: 'center',
    },
    alignItemsEnd: {
      alignItems: 'flex-end',
    },
    paddingLeftSmall: {
      paddingLeft: styleDefaults.marginSize / 2,
    },
    paddingRightSmall: {
      paddingRight: styleDefaults.marginSize / 2,
    },
    paddingHorizontal: {
      paddingLeft: styleDefaults.marginSize,
      paddingRight: styleDefaults.marginSize,
      paddingHorizontal: styleDefaults.marginSize,
    },
    paddingHorizontalSmall: {
      paddingLeft: styleDefaults.marginSize / 2,
      paddingRight: styleDefaults.marginSize / 2,
      paddingHorizontal: styleDefaults.marginSize / 2,
    },
    paddingHorizontalTiny: {
      paddingLeft: styleDefaults.marginSize / 4,
      paddingRight: styleDefaults.marginSize / 4,
      paddingHorizontal: styleDefaults.marginSize / 4,
    },
    paddingHorizontalLarge: {
      paddingLeft: styleDefaults.marginSize * 2,
      paddingRight: styleDefaults.marginSize * 2,
      paddingHorizontal: styleDefaults.marginSize * 2,
    },
    paddingVertical: {
      paddingVertical: styleDefaults.marginSize,
    },
    paddingVerticalSmall: {
      paddingVertical: styleDefaults.marginSize / 2,
    },
    paddingVerticalTiny: {
      paddingVertical: styleDefaults.marginSize / 4,
    },
    paddingBottom: {
      paddingBottom: styleDefaults.marginSize,
    },
    paddingBottomSmall: {
      paddingBottom: styleDefaults.marginSize / 2,
    },
    paddingBottomZero: {
      paddingBottom: 0,
    },
    paddingTop: {
      paddingTop: styleDefaults.marginSize,
    },
    paddingTopSmall: {
      paddingTop: styleDefaults.marginSize / 2,
    },
    paddingSmall: {
      padding: styleDefaults.marginSize / 2,
    },
    verticalContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    marginTopSmall: {
      marginTop: styleDefaults.marginSize / 2,
    },
    marginBottomSmall: {
      marginBottom: styleDefaults.marginSize / 2,
    },
    marginBottomMedium: {
      marginBottom: styleDefaults.marginSize * 1.5,
    },
    marginBottomZero: {
      marginBottom: 0,
    },
    bold: {
      fontWeight: 'bold',
    },
    underline: {
      textDecorationLine: 'underline',
    },
    marginZero: {
      // margin: 0 not good enough.
      marginVertical: 0,
      marginHorizontal: 0,
    },
    marginTopZero: {
      marginTop: 0,
    },
    paddingHorizontalZero: {
      paddingHorizontal: 0,
    },
    paddingVerticalZero: {
      paddingVertical: 0,
    },
    paddingLeftZero: {
      paddingLeft: 0,
    },
    paddingRightZero: {
      paddingRight: 0,
    },
    spacerWidth: {
      width: styleDefaults.avatarSizeSmall * 2 + styleDefaults.marginSize,
    },
    justifyCenter: {
      justifyContent: 'center',
    },
    justifySpaceBetween: {
      justifyContent: 'space-between',
    },
    justifySpaceEvenly: {
      justifyContent: 'space-evenly',
    },
    // https://github.com/facebook/react-native/issues/30034
    verticallyInverted: {
      scaleY: -1,
    },
    fullWidth: {
      width: '100%',
    },
    headerImage: {
      width: styleDefaults.headerImageSize,
      height: styleDefaults.headerImageSize,
    },
    backgroundTransparent: {
      backgroundColor: 'transparent',
    },
    positionAbsolute: {
      position: 'absolute',
    },
    navigationHeaderTitle: {
      fontSize: Platform.select({
        ios: 17,
        android: 20,
        default: 20,
      }),
      lineHeight: undefined,
      fontFamily: 'sans-serif-medium',
    },
    italics: {
      fontStyle: 'italic',
    },
    borderBottomZero: {
      borderBottomWidth: 0,
    },
    emoji: {
      width: 20, //styleDefaults.fontSize * 1.5,
      height: 20, //styleDefaults.fontSize * 1.5,
    },
    textCenter: {
      textAlign: 'center',
    },
    flexGrow: {
      flexGrow: 1,
    },
    heightFull: {
      height: '100%',
    },
    cardBannerWidth: {
      minWidth: styleDefaults.marginSize * 2,
      width: styleDefaults.marginSize * 2,
    },
    fontSizeDefault: {
      fontSize: styleDefaults.fontSize,
    },
    fontSizeLabel: {
      fontSize: styleDefaults.fontSize * 0.75,
    },
    fontFamilyNormal: {
      fontFamily: 'sans-serif',
    },
    monospace: {
      fontFamily: isIOS ? 'Menlo' : 'monospace',
    },
    overflowHidden: {
      overflow: 'hidden',
    },
    linkText: {
      textDecorationLine: 'underline',
    },
    contentPostForm: {
      minHeight: styleDefaults.marginSize * 4,
    },
    minHeightLarge: {
      minHeight: styleDefaults.marginSize * 2,
    },
    minTouchTarget: {
      minWidth: styleDefaults.minTouchTarget,
      minHeight: styleDefaults.minTouchTarget,
    },
    fabBase: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
    disabled: {
      opacity: 0.5,
    },
    /**
     * Centered loading indicator container. Used for day switching and initial load states.
     */
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    roundedBorderLarge: {
      borderRadius: theme.roundness * 4,
      borderTopLeftRadius: theme.roundness * 4,
      borderTopRightRadius: theme.roundness * 4,
    },
    roundedBorder: {
      borderRadius: theme.roundness,
      borderTopLeftRadius: theme.roundness,
      borderTopRightRadius: theme.roundness,
    },
    roundedBorderCardLeft: {
      borderTopStartRadius: theme.roundness * 3,
      borderBottomStartRadius: theme.roundness * 3,
    },
    roundedBorderCard: {
      borderRadius: theme.roundness * 3,
    },
    primaryContainer: {
      backgroundColor: theme.colors.primaryContainer,
      // Disabling this from the ForumPostMessageView because it's not playing
      // nice with the UserBylineTag privilege distinction. Since unifying all
      // colors to higher contrast it shouldn't be a problem.
      // color: theme.colors.onPrimaryContainer,
    },
    secondaryContainer: {
      backgroundColor: theme.colors.secondaryContainer,
      // Disabling this from the ForumPostMessageView because it's not playing
      // nice with the UserBylineTag privilege distinction. Since unifying all
      // colors to higher contrast it shouldn't be a problem.
      // color: theme.colors.onSecondaryContainer,
    },
    onSecondaryContainer: {
      color: theme.colors.onSecondaryContainer,
    },
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.onPrimary,
    },
    twitarrPositive: {
      backgroundColor: theme.colors.twitarrPositiveButton,
    },
    twitarrNeutral: {
      backgroundColor: theme.colors.twitarrNeutralButton,
    },
    twitarrNegative: {
      backgroundColor: theme.colors.twitarrNegativeButton,
    },
    twitarrBanner: {
      backgroundColor: theme.colors.twitarrYellow,
    },
    background: {
      backgroundColor: theme.colors.background,
    },
    backgroundVideo: {
      flex: 1,
    },
    onBackground: {
      color: theme.colors.onBackground,
    },
    tertiaryContainer: {
      backgroundColor: theme.colors.tertiaryContainer,
      // color: theme.colors.onTertiaryContainer,
    },
    onTertiaryContainer: {
      color: theme.colors.onTertiaryContainer,
    },
    noteContainer: {
      backgroundColor: theme.colors.twitarrYellow,
    },
    onNoteContainer: {
      color: theme.colors.onTwitarrYellow,
    },
    onTwitarrBanner: {
      color: theme.colors.onTwitarrYellow,
    },
    errorContainer: {
      backgroundColor: theme.colors.errorContainer,
      color: theme.colors.onErrorContainer,
    },
    onTwitarrButton: {
      color: theme.colors.onTwitarrPositiveButton,
    },
    borderBottom: {
      borderBottomColor: theme.colors.onBackground,
      borderBottomWidth: 1,
    },
    error: {
      backgroundColor: theme.colors.error,
    },
    onError: {
      color: theme.colors.onError,
    },
    surfaceVariant: {
      // I don't like the contrast with the current onSurfaceVariant.
      color: theme.colors.onBackground,
      backgroundColor: theme.colors.surfaceVariant,
    },
    onSurfaceVariant: {
      color: theme.colors.onSurfaceVariant,
    },
    onImageViewer: {
      color: theme.colors.onImageViewer,
    },
    imageViewerBackgroundAlpha: {
      backgroundColor: theme.colors.constantAlphaBlack,
    },
    chipContainer: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      flexWrap: 'wrap',
      paddingTop: styleDefaults.marginSize / 2,
    },
    chip: {
      marginRight: styleDefaults.marginSize / 2,
      marginBottom: styleDefaults.marginSize / 2,
    },
    hyperlinkTag: {
      // This was originally meant to be a Discord-style rounded "pill" background, but
      // borderRadius (and padding) do not apply to a Text nested inside another Text on
      // either platform, on old or new architecture, and there's no ETA on a fix:
      // https://github.com/facebook/react-native/issues/45925
      // https://github.com/facebook/react-native/issues/54826
      // So instead this is just a colored, bold, icon-prefixed inline flair with no
      // background/border-radius/padding to work around the bug.
      textDecorationLine: 'none', // cancel the inherited underline from linkStyle
    },
    onHyperlinkTag: {
      color: theme.colors.primary,
    },
    imageViewerBackground: {
      backgroundColor: theme.colors.constantBlack,
      color: theme.colors.constantWhite,
    },
    onMenu: {
      backgroundColor: theme.colors.elevation.level2,
    },
    headerLeftWrapper: {
      // This is close enough on Android. Haven't seen anything on iOS yet.
      marginRight: isAndroid ? 16 : 15,
      marginLeft: isAndroid ? 14 : 5,
    },
    relativeTimeMinWidth: {
      minWidth: styleDefaults.marginSize * 3,
    },
    textAlignRight: {
      textAlign: 'right',
    },
  });

export type CommonStyles = ReturnType<typeof createCommonStyles>;

export const StyleProvider = ({children}: PropsWithChildren) => {
  const {theme} = useAppTheme();

  const commonStyles = useMemo(() => createCommonStyles(theme), [theme]);

  const screenOptions = useMemo(
    () => ({
      // headerStyle seems to only accept backgroundColor.
      // https://reactnavigation.org/docs/elements/#headerstyle
      headerStyle: commonStyles.background,
      headerTitleStyle: commonStyles.background,
      headerTintColor: theme.colors.onBackground,
      // Add padding to header button containers for @react-navigation/stack
      // (native-stack had this by default, but stack does not)
      // Use smaller padding for left side to accommodate back button positioning
      headerLeftContainerStyle: {
        paddingLeft: 4,
      },
      headerRightContainerStyle: {
        paddingRight: 16,
      },
      // This is needed to prevent iOS from crowding the header.
      // Got the idea from https://github.com/react-navigation/react-navigation/issues/11337
      // https://reactnavigation.org/docs/header-buttons/
      headerBackTitle: 'Back',
    }),
    [commonStyles, theme.colors.onBackground],
  );

  const contextValue = useMemo(() => ({commonStyles, styleDefaults, screenOptions}), [commonStyles, screenOptions]);

  return <StyleContext.Provider value={contextValue}>{children}</StyleContext.Provider>;
};
