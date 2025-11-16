import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {Menu} from 'react-native-paper';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsModerateItemProps {
  closeMenu: () => void;
  forumPost: PostData;
  navigation: StackNavigationProp<CommonStackParamList>;
}

export const ForumPostActionsModerateItem = ({forumPost, closeMenu, navigation}: ForumPostActionsModerateItemProps) => {
  const {hasModerator} = usePrivilege();

  if (!hasModerator) {
    return null;
  }

  return (
    <Menu.Item
      title={'Moderate'}
      dense={false}
      leadingIcon={AppIcons.moderator}
      onPress={() => {
        closeMenu();
        navigation.push(CommonStackComponents.siteUIScreen, {
          resource: 'forumpost',
          id: forumPost.postID.toString(),
          moderate: true,
        });
      }}
    />
  );
};
