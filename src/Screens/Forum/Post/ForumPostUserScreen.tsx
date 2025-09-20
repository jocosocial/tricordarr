import React from 'react';
import {ForumPostScreenBase} from './ForumPostScreenBase';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumPostUserScreen>;

export const ForumPostUserScreen = ({route}: Props) => {
  return (
    <ForumPostScreenBase
      refreshOnUserNotification={true}
      queryParams={{creatorid: route.params.user.userID}}
      title={`Posts by @${route.params.user.username}`}
    />
  );
};
