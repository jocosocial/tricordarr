import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EventStackParamList} from '../../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents, NavigatorIDs} from '../../../../libraries/Enums/Navigation';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventFavoritesScreen,
  NavigatorIDs.eventStack
>;

export const EventFavoritesScreen = ({navigation}: Props) => {
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>Favorites</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
