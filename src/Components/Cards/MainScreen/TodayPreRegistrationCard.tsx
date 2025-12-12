import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const TodayPreRegistrationCard = () => {
  const {commonStyles} = useStyles();
  const commonNavigation = useCommonStack();

  const styles = StyleSheet.create({
    card: {
      ...commonStyles.twitarrNeutral,
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

  const onPress = () => {
    commonNavigation.push(CommonStackComponents.preRegistrationHelpScreen);
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Title title={'Twitarr Pre-Registration'} titleStyle={styles.title} />
      <Card.Content style={styles.content}>
        <Text style={styles.text}>
          Ahoy landlubber! Welcome to Twitarr, your onboard social media server for the JoCo Cruise.
        </Text>
      </Card.Content>
      <Card.Content style={styles.content}>
        <Text style={styles.text}>
          Twitarr's social media features aren't enabled right now (see the JoCo Discord instead), but setting up your
          account now means your username, profile, and avatar picture will be ready to go when you step on the boat.
          Don't forget your password!
        </Text>
      </Card.Content>
      <Card.Content style={styles.content}>
        <Text style={styles.text}>
          Tap here for more information about what you can do in Twitarr before the cruise starts.
        </Text>
      </Card.Content>
    </Card>
  );
};
