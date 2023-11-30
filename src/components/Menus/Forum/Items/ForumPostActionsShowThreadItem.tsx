import {AppIcons} from '../../../../libraries/Enums/Icons';
import {Menu} from 'react-native-paper';
import React from 'react';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {BottomTabComponents, ForumStackComponents, RootStackComponents} from '../../../../libraries/Enums/Navigation';
import {RootStackParamList} from '../../../Navigation/Stacks/RootStackNavigator';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface ForumPostActionsShowThreadItemProps {
  forumPost: PostData;
  closeMenu: () => void;
  rootNavigation: NativeStackNavigationProp<RootStackParamList>;
}

export const ForumPostActionsShowThreadItem = ({
  forumPost,
  closeMenu,
  rootNavigation,
}: ForumPostActionsShowThreadItemProps) => {
  const onPress = () => {
    closeMenu();
    rootNavigation.push(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.forumsTab,
      params: {
        screen: ForumStackComponents.forumThreadScreen,
        params: {
          postID: forumPost.postID.toString(),
        },
        initial: false,
      },
    });
  };
  return <Menu.Item dense={false} leadingIcon={AppIcons.forum} title={'View In Thread'} onPress={onPress} />;
};
