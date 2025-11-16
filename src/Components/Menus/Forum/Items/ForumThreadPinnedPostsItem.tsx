import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';

interface ForumThreadPinnedPostsItemProps {
  navigation: StackNavigationProp<CommonStackParamList>;
  forumID: string;
}

export const ForumThreadPinnedPostsItem = ({navigation, forumID}: ForumThreadPinnedPostsItemProps) => {
  return (
    <Item
      title={'Pinned Posts'}
      iconName={AppIcons.pin}
      onPress={() => {
        navigation.push(CommonStackComponents.forumPostPinnedScreen, {
          forumID: forumID,
        });
      }}
    />
  );
};
