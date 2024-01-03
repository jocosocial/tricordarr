import React from 'react';
import {ForumPostScreenBase} from './ForumPostScreenBase';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../../libraries/Enums/Navigation';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumPostHashtagScreen,
  NavigatorIDs.forumStack
>;

export const ForumPostHashtagScreen = (props: Props) => {
  return (
    <ForumPostScreenBase
      refreshOnUserNotification={false}
      queryParams={{hashtag: props.route.params.hashtag}}
      title={props.route.params.hashtag}
    />
  );
};
