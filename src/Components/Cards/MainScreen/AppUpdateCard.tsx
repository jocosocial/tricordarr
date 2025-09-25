import React from 'react';
import {Linking, StyleSheet, View} from 'react-native';
import {Card, Text, TouchableRipple} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useAppTheme} from '#src/Styles/Theme';

interface AppUpdateCardProps {
  currentVersion: string;
  latestVersion: string;
}

export const AppUpdateCard = (props: AppUpdateCardProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();

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

  const onPress = () => Linking.openURL('https://play.google.com/store/apps/details?id=com.tricordarr');

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
