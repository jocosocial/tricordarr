import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {OobeButtonsView} from '../../Views/OobeButtonsView';

type Props = NativeStackScreenProps<
  OobeStackParamList,
  OobeStackComponents.oobeNotificationsScreen,
  NavigatorIDs.oobeStack
>;

export const OobeNotificationsScreen = ({navigation}: Props) => {
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text>Notificatoins</Text>
        </PaddedContentView>
        <OobeButtonsView
          leftOnPress={() => navigation.goBack()}
          rightText={'I Agree'}
          rightOnPress={() => navigation.push(OobeStackComponents.oobeFinishScreen)}
        />
      </ScrollingContentView>
    </AppView>
  );
};
