import React from 'react';
import {Card, Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppImage} from '#src/Hooks/Images/useAppImage';

// @ts-ignore
import twitarrteam from '#assets/contributors/twitarrteam.jpg';

export const OobeNoteCard = () => {
  const {commonStyles} = useStyles();
  const {fromAsset} = useAppImage();
  return (
    <Card>
      <Card.Title title={'From the Twitarr Dev Team:'} titleVariant={'bodyLarge'} titleStyle={[commonStyles.bold]} />
      <Card.Content style={commonStyles.marginBottom}>
        <Text>
          Thanks for using our app! We hope it enhances your vacation the way it does for us. Be excellent to each other
          and have a great cruise!
        </Text>
      </Card.Content>
      <AppImage image={fromAsset(twitarrteam, 'twitarrteam.jpg')} mode={'cardcover'} />
    </Card>
  );
};
