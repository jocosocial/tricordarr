import {StackNavigationProp} from '@react-navigation/stack';
import * as React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';

interface ModerateMenuItemProps {
  closeMenu: () => void;
  resource: 'forum' | 'photostream';
  resourceID: string;
  navigation: StackNavigationProp<CommonStackParamList>;
}
export const ModerateMenuItem = (props: ModerateMenuItemProps) => {
  return (
    <Menu.Item
      dense={false}
      leadingIcon={AppIcons.moderator}
      title={'Moderate'}
      onPress={() => {
        props.navigation.push(CommonStackComponents.siteUIScreen, {
          resource: props.resource,
          id: props.resourceID,
          moderate: true,
        });
        props.closeMenu();
      }}
    />
  );
};
