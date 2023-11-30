import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../../../libraries/Enums/Navigation';
import React from 'react';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {RootStackParamList} from '../../../Navigation/Stacks/RootStackNavigator';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface ForumPostActionsModerateItemProps {
  closeMenu: () => void;
  forumPost: PostData;
  rootNavigation: NativeStackNavigationProp<RootStackParamList>;
}

export const ForumPostActionsModerateItem = ({
  forumPost,
  closeMenu,
  rootNavigation,
}: ForumPostActionsModerateItemProps) => {
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
        rootNavigation.push(RootStackComponents.rootContentScreen, {
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
