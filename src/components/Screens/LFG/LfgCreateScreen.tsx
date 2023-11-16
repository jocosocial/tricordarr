import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgStackParamList} from '../../Navigation/Stacks/LFGStackNavigator';
import {LfgStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';

export type Props = NativeStackScreenProps<LfgStackParamList, LfgStackComponents.lfgCreateScreen, NavigatorIDs.lfgStack>;

export const LfgCreateScreen = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <Text>Create!</Text>
      </ScrollingContentView>
    </AppView>
  );
};
