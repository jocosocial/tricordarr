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
      ...commonStyles.twitarrPositive,
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
      <Card.Title title={'Pre-Registration Setup'} titleStyle={styles.title} />
      <Card.Content style={styles.content}>
        <Text style={styles.text}>
          Twitarr's social media features aren't enabled right now (see the JoCo Discord instead). Tap here for more
          information about what you can do in the app before the cruise starts.
        </Text>
      </Card.Content>
    </Card>
  );
};
