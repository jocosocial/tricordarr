import {encode as base64_encode} from 'base-64';
import React from 'react';
import {Image} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {getDayMarker} from '#src/Libraries/DateTime';

// @ts-ignore
import preregistration from '#assets/preregistration.jpg';

export const OobePreRegistrationCompleteCard = () => {
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  return (
    <Card>
      <Card.Title title={'Pre-Registration Complete!'} titleVariant={'bodyLarge'} titleStyle={[commonStyles.bold]} />
      <Card.Content style={commonStyles.marginBottom}>
        <Text>
          That's it for now! You're all set to sail. You can come back to this app in pre-registration mode until{' '}
          {getDayMarker(appConfig.preRegistrationEndDate.toISOString(), appConfig.portTimeZoneID)}. After that there's
          nothing for it to do until you board the ship. Other than pack.
        </Text>
      </Card.Content>
      <AppImage
        image={{
          dataURI: Image.resolveAssetSource(preregistration).uri,
          mimeType: 'image/jpeg',
          fileName: 'preregistration.jpg',
          base64: base64_encode(preregistration),
        }}
        mode={'cardcover'}
      />
    </Card>
  );
};
