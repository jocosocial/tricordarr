import React from 'react';
import {Card, Text} from 'react-native-paper';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {Linking} from 'react-native';

export const TimezoneWarningCard = () => {
  const {commonStyles} = useStyles();
  const onPress = () => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/time`);
  return (
    <Card style={commonStyles.twitarrNegative} onPress={onPress}>
      <Card.Title
        title={'Time Zone Warning'}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.bold]}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={[commonStyles.onTwitarrButton]}
      />
      <Card.Content>
        <Text style={[commonStyles.onTwitarrButton]}>
          Your device and the server appear to be in different time zones. Tap this card to view more information.
          Remember that the ship clocks are right and Twitarr can be wrong.
        </Text>
      </Card.Content>
    </Card>
  );
};
