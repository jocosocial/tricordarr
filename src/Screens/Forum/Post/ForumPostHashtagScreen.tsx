import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumPostHashtagScreen>;

export const ForumPostHashtagScreen = (props: Props) => {
  return (
    <ForumPostScreenBase
      refreshOnUserNotification={false}
      queryParams={{hashtag: props.route.params.hashtag}}
      title={props.route.params.hashtag}
    />
  );
};
