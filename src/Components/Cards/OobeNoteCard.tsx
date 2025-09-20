import {encode as base64_encode} from 'base-64';
import React from 'react';
import {Image} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';

// @ts-ignore
import twitarrteam from '#assets/contributors/twitarrteam.jpg';

export const OobeNoteCard = () => {
  const {commonStyles} = useStyles();
  return (
    <Card>
      <Card.Title title={'From the Twitarr Dev Team:'} titleVariant={'bodyLarge'} titleStyle={[commonStyles.bold]} />
      <Card.Content style={commonStyles.marginBottom}>
        <Text>
          Thanks for using our app! We hope it enhances your vacation the way it does for us. Be excellent to each other
          and have a great cruise!
        </Text>
      </Card.Content>
      <AppImage
        image={{
          dataURI: Image.resolveAssetSource(twitarrteam).uri,
          mimeType: 'image/jpeg',
          fileName: 'twitarrteam.jpg',
          base64: base64_encode(twitarrteam),
        }}
        mode={'cardcover'}
      />
    </Card>
  );
};
