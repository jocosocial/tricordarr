import {AppView} from '../../Views/AppView';
import React from 'react';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumPostEditScreen,
  NavigatorIDs.forumStack
>;

export const ForumPostEditScreen = ({route, navigation}: Props) => {
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>{route.params.postData.text}</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
