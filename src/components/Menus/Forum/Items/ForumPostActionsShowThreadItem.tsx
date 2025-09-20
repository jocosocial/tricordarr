import {AppIcons} from '../../../../Libraries/Enums/Icons';
import {Menu} from 'react-native-paper';
import React from 'react';
import {PostData} from '../../../../Libraries/Structs/ControllerStructs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';

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
