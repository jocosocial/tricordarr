import {AppView} from '../AppView';
import {Text, useTheme} from 'react-native-paper';
import React from 'react';
import {AppContainerView} from '../AppContainerView';
import {SaveButton} from '../../Buttons/SaveButton';
import {Linking} from 'react-native';
import {AppSettings} from '../../../libraries/AppSettings';
import {commonStyles} from '../../../styles';

export const SeamailView = () => {
  const theme = useTheme();

  async function onPress() {
    const serverUrl = await AppSettings.SERVER_URL.getValue();
    await Linking.openURL(`${serverUrl}/seamail`);
  }

  return (
    <AppView>
      <AppContainerView>
        <Text variant={'titleLarge'}>This area is still under construction!</Text>
        <Text style={commonStyles.marginTop}>Press the button below to open Twitarr in your browser.</Text>
        <SaveButton buttonText={'Open Browser'} buttonColor={theme.colors.twitarrNeutralButton} onPress={onPress} />
      </AppContainerView>
    </AppView>
  );
};
