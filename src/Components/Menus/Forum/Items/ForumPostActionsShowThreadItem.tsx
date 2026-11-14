import React from 'react';
import {Menu} from 'react-native-paper';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsShowThreadItemProps {
  forumPost: PostData;
  closeMenu: () => void;
}

export const ForumPostActionsShowThreadItem = ({forumPost, closeMenu}: ForumPostActionsShowThreadItemProps) => {
  const navigation = useCommonStack();
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
