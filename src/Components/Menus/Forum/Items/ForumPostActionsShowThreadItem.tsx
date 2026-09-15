import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {Menu} from 'react-native-paper';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsShowThreadItemProps {
  forumPost: PostData;
  closeMenu: () => void;
  navigation: StackNavigationProp<CommonStackParamList>;
}

export const ForumPostActionsShowThreadItem = ({
  forumPost,
  closeMenu,
  navigation,
}: ForumPostActionsShowThreadItemProps) => {
  const {asPrivilegedUser} = useElevation();

  const onPress = () => {
    closeMenu();
    navigation.push(CommonStackComponents.forumThreadPostScreen, {
      postID: forumPost.postID.toString(),
      asPrivilegedUser,
    });
  };
  return <Menu.Item dense={false} leadingIcon={AppIcons.forum} title={'View In Thread'} onPress={onPress} />;
};
