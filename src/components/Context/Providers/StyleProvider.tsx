import React, {PropsWithChildren} from 'react';
import {StyleContext} from '../Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {commonStyles, styleDefaults} from '../../../styles';
import {StyleSheet} from 'react-native';
import {AndroidColor} from '@notifee/react-native';

export const StyleProvider = ({children}: PropsWithChildren) => {
  const theme = useAppTheme();

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
      color: theme.colors.onPrimaryContainer,
    },
    secondaryContainer: {
      backgroundColor: theme.colors.secondaryContainer,
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
      color: AndroidColor.BLACK,
    },
    errorContainer: {
      backgroundColor: theme.colors.errorContainer,
      color: theme.colors.onErrorContainer,
    },
    onTwitarrButton: {
      color: AndroidColor.WHITE,
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
  });

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTitleStyle: {
      color: theme.colors.onBackground,
    },
    headerTintColor: theme.colors.onBackground,
  };

  return (
    <StyleContext.Provider value={{commonStyles: themedStyles, styleDefaults, screenOptions}}>
      {children}
    </StyleContext.Provider>
  );
};
