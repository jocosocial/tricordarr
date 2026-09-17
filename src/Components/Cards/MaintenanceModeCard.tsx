import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {useAppImage} from '#src/Hooks/Images/useAppImage';

// @ts-ignore
import maintenance from '#assets/maintenance.jpg';

export const MaintenanceModeCard = () => {
  const {commonStyles} = useStyles();
  const {minAccessLevel} = useClientSettings();
  const {fromAsset} = useAppImage();

  const styles = StyleSheet.create({
    card: {
      ...commonStyles.twitarrNegative,
    },
    title: {
      ...commonStyles.onTwitarrButton,
      ...commonStyles.bold,
    },
    content: {
      ...commonStyles.marginBottomSmall,
    },
    text: {
      ...commonStyles.onTwitarrButton,
    },
  });

  return (
    <Card style={styles.card}>
      <Card.Title title={'Maintenance Mode'} titleStyle={styles.title} />
      <Card.Content style={styles.content}>
        <Text style={styles.text}>
          The server is currently in maintenance mode. Only {UserAccessLevel.getLabel(minAccessLevel)} users and above
          may use this section of Twitarr right now.
        </Text>
      </Card.Content>
      <AppImage image={fromAsset(maintenance, 'maintenance.jpg')} mode={'cardcover'} />
    </Card>
  );
};
