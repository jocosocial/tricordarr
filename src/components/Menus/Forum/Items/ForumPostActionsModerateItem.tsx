import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../../../libraries/Enums/Navigation';
import React from 'react';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {useRootStack} from '../../../Navigation/Stacks/RootStackNavigator';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';

interface ForumPostActionsModerateItemProps {
  closeMenu: () => void;
  forumPost: PostData;
}

export const ForumPostActionsModerateItem = ({forumPost, closeMenu}: ForumPostActionsModerateItemProps) => {
  const {hasModerator} = usePrivilege();
  const rootStackNavigation = useRootStack();

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
        rootStackNavigation.push(RootStackComponents.rootContentScreen, {
          screen: BottomTabComponents.homeTab,
          params: {
            screen: MainStackComponents.siteUIScreen,
            params: {
              resource: 'forumpost',
              id: forumPost.postID.toString(),
              moderate: true,
            },
            initial: false,
          },
        });
      }}
    />
  );
};
