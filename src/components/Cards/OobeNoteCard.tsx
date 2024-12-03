import {Card, Text} from 'react-native-paper';
// @ts-ignore
import twitarrteam from '../../../assets/contributors/twitarrteam.jpg';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {AppImage} from '../Images/AppImage.tsx';
import {Image} from 'react-native';
import {encode as base64_encode} from 'base-64';

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
      {/*<Card.Cover source={twitarrteam} />*/}
    </Card>
  );
};
