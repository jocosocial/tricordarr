import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeRegisterScreen, NavigatorIDs.oobeStack>;

export const OobeRegisterScreen = ({navigation}: Props) => {
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <Text>Register!</Text>
      </ScrollingContentView>
    </AppView>
  );
};
