import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeWelcomeScreen, NavigatorIDs.oobeStack>;

export const OobeWelcomeScreen = ({navigation}: Props) => {
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text style={{textAlign: 'center'}} variant={'displayLarge'}>
            Welcome to Twitarr!
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={{textAlign: 'center'}}>The on-board bespoke communication platform of the JoCo Cruise.</Text>
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView rightText={'Next'} rightOnPress={() => navigation.push(OobeStackComponents.oobeServerScreen)} />
    </AppView>
  );
};
