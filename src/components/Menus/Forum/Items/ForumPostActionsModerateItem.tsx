import {Menu} from 'react-native-paper';
import {AppIcons} from '#src/Enums/Icons';
import React from 'react';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {PostData} from '#src/Structs/ControllerStructs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';

interface ForumPostActionsModerateItemProps {
  closeMenu: () => void;
  forumPost: PostData;
  navigation: NativeStackNavigationProp<CommonStackParamList>;
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
