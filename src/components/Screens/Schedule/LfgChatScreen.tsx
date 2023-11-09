import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScheduleStackParamList} from '../../Navigation/Stacks/ScheduleStackNavigator';
import {NavigatorIDs, ScheduleStackComponents} from '../../../libraries/Enums/Navigation';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.lfgChatScreen,
  NavigatorIDs.scheduleStack
>;

export const LfgChatScreen = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>Hi</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
