import React from 'react';
import {ForumPostScreenBase} from './ForumPostScreenBase';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../../libraries/Enums/Navigation';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumPostUserScreen,
  NavigatorIDs.forumStack
>;

export const ForumPostUserScreen = ({route}: Props) => {
  return (
    <ForumPostScreenBase
      refreshOnUserNotification={true}
      queryParams={{creatorid: route.params.user.userID}}
      title={`Posts by @${route.params.user.username}`}
    />
  );
};
