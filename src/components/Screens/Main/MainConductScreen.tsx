import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {BoldText} from '../../Text/BoldText';
import {ConductView} from '../../Views/Static/ConductView';

export const MainConductScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <ConductView />
      </ScrollingContentView>
    </AppView>
  );
};
