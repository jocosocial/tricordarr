import React, {PropsWithChildren} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {StyleContext} from '#src/Context/Contexts/StyleContext';
import {commonStyles, styleDefaults} from '#src/Styles';
import {useAppTheme} from '#src/Styles/Theme';

export const StyleProvider = ({children}: PropsWithChildren) => {
  const theme = useAppTheme();
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
      color: theme.colors.onBackground,
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
      marginRight: Platform.select({android: 30, default: 15}),
    },
  });

  const screenOptions = {
    // headerStyle seems to only accept backgroundColor.
    // https://reactnavigation.org/docs/elements/#headerstyle
    headerStyle: themedStyles.background,
    headerTitleStyle: themedStyles.background,
    headerTintColor: theme.colors.onBackground,
  };

  return (
    <StyleContext.Provider value={{commonStyles: themedStyles, styleDefaults, screenOptions}}>
      {children}
    </StyleContext.Provider>
  );
};
