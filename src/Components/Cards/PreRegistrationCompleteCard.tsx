import React from 'react';
import {Card, Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppImage} from '#src/Hooks/Images/useAppImage';

// @ts-ignore
import preregistration from '#assets/preregistration.jpg';

export const PreRegistrationCompleteCard = () => {
  const {commonStyles} = useStyles();
  const {fromAsset} = useAppImage();
  return (
    <Card>
      <Card.Title title={'Pre-Registration Complete!'} titleVariant={'bodyLarge'} titleStyle={[commonStyles.bold]} />
      <Card.Content style={commonStyles.marginBottom}>
        <Text>
          Parts of Twitarr aren't available until we're on the ship as we're currently busy scraping off the barnacles.
          You can come back to this app in pre-registration mode until the cruise starts.
        </Text>
        <Text>
          Once you are physically on board the ship and connected to ship wifi, tap the blue banner at the top of any
          screen to connect to Twitarr on-board.
        </Text>
      </Card.Content>
      <AppImage image={fromAsset(preregistration, 'preregistration.jpg')} mode={'cardcover'} />
    </Card>
  );
};
