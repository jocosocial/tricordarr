import {Card, Text} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useConfig} from '../Context/Contexts/ConfigContext.ts';
import {getDayMarker} from '../../libraries/DateTime.ts';

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
    </Card>
  );
};
