import React, {PropsWithChildren} from 'react';
import {StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {StyleContext} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {isAndroid} from '#src/Libraries/Platform/Detection';
import {commonStyles, styleDefaults} from '#src/Styles';

export const StyleProvider = ({children}: PropsWithChildren) => {
  const {theme} = useAppTheme();
  const inset = useSafeAreaInsets();

  const themedStyles = StyleSheet.create({
    ...commonStyles,
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
    onImageViewer: {
      color: theme.colors.onImageViewer,
    },
    imageViewerBackgroundAlpha: {
      backgroundColor: theme.colors.constantAlphaBlack,
    },
    chipContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.flexStart,
      ...commonStyles.flexWrap,
      ...commonStyles.paddingTopSmall,
    },
    chip: {
      ...commonStyles.marginRightSmall,
      ...commonStyles.marginBottomSmall,
    },
    imageViewerBackground: {
      backgroundColor: theme.colors.constantBlack,
      color: theme.colors.constantWhite,
    },
    safeMarginTop: {
      marginTop: inset.top,
    },
    safePaddingVertical: {
      paddingTop: inset.top,
      paddingBottom: inset.bottom,
    },
    safeMarginBottom: {
      marginBottom: inset.bottom,
    },
    safePaddingTop: {
      paddingTop: inset.top,
    },
    safePaddingBottom: {
      paddingBottom: inset.bottom,
    },
    onMenu: {
      backgroundColor: theme.colors.elevation.level2,
    },
    headerLeftWrapper: {
      // This is close enough on Android. Haven't seen anything on iOS yet.
      marginRight: isAndroid ? 16 : 15,
      marginLeft: isAndroid ? 14 : 5,
    },
    // This was the "now" not rendering.
    // https://github.com/jocosocial/tricordarr/issues/419
    relativeTimeMinWidth: {
      minWidth: 70,
    },
    variantLabelSmall: {
      fontFamily: 'System', // iOS; 'sans-serif-medium' on Android
      fontWeight: '500',
      letterSpacing: 0.5, // overrides mediumType's 0.15
      lineHeight: 16,
      fontSize: 11,
      color: theme.colors.onBackground,
    },
    variantLabelMedium: {
      fontFamily: 'System',
      fontWeight: '500',
      letterSpacing: 0.5,
      lineHeight: 16,
      fontSize: 12,
      color: theme.colors.onBackground,
    },
    variantBodyMedium: {
      fontFamily: 'System',
      fontWeight: '400',
      letterSpacing: 0.25,
      lineHeight: 20,
      fontSize: 14,
      color: theme.colors.onBackground,
    },
  });

  const screenOptions = {
    // headerStyle seems to only accept backgroundColor.
    // https://reactnavigation.org/docs/elements/#headerstyle
    headerStyle: themedStyles.background,
    headerTitleStyle: themedStyles.background,
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
  };

  return (
    <StyleContext.Provider value={{commonStyles: themedStyles, styleDefaults, screenOptions}}>
      {children}
    </StyleContext.Provider>
  );
};
