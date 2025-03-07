import React, {PropsWithChildren} from 'react';
import {StyleContext} from '../Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {commonStyles, styleDefaults} from '../../../styles';
import {StyleSheet} from 'react-native';
import {AndroidColor} from '@notifee/react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
      color: AndroidColor.BLACK,
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
    chipContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.flexStart,
      ...commonStyles.flexWrap,
      ...commonStyles.paddingTopSmall,
    },
    imageViewerBackground: {
      backgroundColor: AndroidColor.BLACK,
      color: AndroidColor.WHITE,
      opacity: 0.7,
    },
    safeMarginTop: {
      marginTop: inset.top,
    },
    safePaddingVertical: {
      paddingTop: inset.top,
      paddingBottom: inset.bottom,
    },
  });

  const screenOptions = {
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
