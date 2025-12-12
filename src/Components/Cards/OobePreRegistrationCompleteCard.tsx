import React from 'react';
import {Card, Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import preregistration from '#assets/preregistration.jpg';

export const OobePreRegistrationCompleteCard = () => {
  const {commonStyles} = useStyles();
  return (
    <Card>
      <Card.Title title={'Pre-Registration Complete!'} titleVariant={'bodyLarge'} titleStyle={[commonStyles.bold]} />
      <Card.Content style={commonStyles.marginBottom}>
        <Text>
          That's it for now! You're all set to sail. You can come back to this app in pre-registration mode until the
          cruise starts. After that there's nothing for it to do until you board the ship. Other than pack.
        </Text>
      </Card.Content>
      <AppImage image={AppImageMetaData.fromAsset(preregistration, 'preregistration.jpg')} mode={'cardcover'} />
    </Card>
  );
};
