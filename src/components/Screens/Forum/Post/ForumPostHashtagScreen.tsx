import React from 'react';
import {ForumPostScreenBase} from './ForumPostScreenBase';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumPostHashtagScreen>;

export const ForumPostHashtagScreen = (props: Props) => {
  return (
    <ForumPostScreenBase
      refreshOnUserNotification={false}
      queryParams={{hashtag: props.route.params.hashtag}}
      title={props.route.params.hashtag}
    />
  );
};
