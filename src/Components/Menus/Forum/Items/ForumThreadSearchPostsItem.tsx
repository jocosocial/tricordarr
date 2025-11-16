import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {ForumData, ForumListData} from '#src/Structs/ControllerStructs';

interface ForumThreadSearchPostsItemProps {
  navigation: StackNavigationProp<CommonStackParamList>;
  forum: ForumListData | ForumData;
}

export const ForumThreadSearchPostsItem = ({navigation, forum}: ForumThreadSearchPostsItemProps) => {
  return (
    <Item
      title={'Search Posts'}
      iconName={AppIcons.postSearch}
      onPress={() => {
        navigation.push(CommonStackComponents.forumPostSearchScreen, {
          forum: forum,
        });
      }}
    />
  );
};
