import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumPostUserScreen>;

export const ForumPostUserScreen = ({route}: Props) => {
  return (
    <ForumPostScreenBase
      refreshOnUserNotification={true}
      queryParams={{creatorid: route.params.user.userID}}
      title={`Posts by @${route.params.user.username}`}
    />
  );
};
