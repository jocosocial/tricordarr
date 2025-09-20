import {AppIcons} from '../../../../Libraries/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Item} from 'react-navigation-header-buttons';

interface ForumThreadPinnedPostsItemProps {
  navigation: NativeStackNavigationProp<CommonStackParamList>;
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
