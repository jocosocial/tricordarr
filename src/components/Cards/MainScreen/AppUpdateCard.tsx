import {Card, TouchableRipple, Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {Linking, StyleSheet, View} from 'react-native';
import React from 'react';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {AppIcon} from '../../Icons/AppIcon.tsx';

interface AppUpdateCardProps {
  currentVersion: string;
  latestVersion: string;
}

export const AppUpdateCard = (props: AppUpdateCardProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    card: {
      ...commonStyles.twitarrNegative,
    },
    content: {
      ...commonStyles.marginVertical,
    },
    textWrapper: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.marginBottomSmall,
    },
    text: {
      ...commonStyles.onTwitarrButton,
      ...commonStyles.bold,
    },
  });

  const onPress = () => Linking.openURL('https://play.google.com/store/apps/details?id=com.tricordarr');

  return (
    <Card style={styles.card}>
      <TouchableRipple onPress={onPress}>
        <View>
          <Card.Content style={styles.content}>
            <View style={styles.textWrapper}>
              <AppIcon icon={AppIcons.twitarr} />
              <Text style={styles.text}>Tricordarr is out of date.</Text>
            </View>
            <View>
              <Text>
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
