import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsShowThreadItemProps {
  forumPost: PostData;
  closeMenu: () => void;
  navigation: NativeStackNavigationProp<CommonStackParamList>;
}

export const ForumPostActionsShowThreadItem = ({
  forumPost,
  closeMenu,
  navigation,
}: ForumPostActionsShowThreadItemProps) => {
  const onPress = () => {
    closeMenu();
    navigation.push(CommonStackComponents.forumThreadPostScreen, {
      postID: forumPost.postID.toString(),
    });
  };
  return <Menu.Item dense={false} leadingIcon={AppIcons.forum} title={'View In Thread'} onPress={onPress} />;
};
