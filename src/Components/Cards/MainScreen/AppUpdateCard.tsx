import React from 'react';
import {Linking, Platform, StyleSheet, View} from 'react-native';
import {Card, Text, TouchableRipple} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';

interface AppUpdateCardProps {
  currentVersion: string;
  latestVersion: string;
}

export const AppUpdateCard = (props: AppUpdateCardProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {appConfig} = useConfig();

  const styles = StyleSheet.create({
    card: {
      ...commonStyles.twitarrNegative,
      ...commonStyles.onTwitarrButton,
    },
    content: {
      ...commonStyles.marginVertical,
    },
    textWrapper: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.marginBottomSmall,
    },
    headerText: {
      ...commonStyles.onTwitarrButton,
      ...commonStyles.bold,
    },
    bodyText: {
      ...commonStyles.onTwitarrButton,
    },
  });

  const onPress = () =>
    Linking.openURL(
      Platform.select({
        android: 'https://play.google.com/store/apps/details?id=com.tricordarr',
        ios: 'https://apps.apple.com/us/app/tricordarr/id6754777522',
        default: appConfig.serverUrl,
      }),
    );

  return (
    <Card style={styles.card}>
      <TouchableRipple onPress={onPress}>
        <View>
          <Card.Content style={styles.content}>
            <View style={styles.textWrapper}>
              <AppIcon icon={AppIcons.twitarr} color={theme.colors.onTwitarrNegativeButton} />
              <Text style={styles.headerText}>Tricordarr is out of date.</Text>
            </View>
            <View>
              <Text style={styles.bodyText}>
                Update to the latest version ({props.latestVersion}) to ensure a smooth experience. You are currently
                running version {props.currentVersion}.
              </Text>
            </View>
          </Card.Content>
        </View>
      </TouchableRipple>
    </Card>
  );
};
