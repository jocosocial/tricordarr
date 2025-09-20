import {AppIcons} from '#src/Libraries/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Components/Navigation/CommonScreens';
import {Menu} from 'react-native-paper';
import * as React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface ModerateMenuItemProps {
  closeMenu: () => void;
  resource: 'forum' | 'photostream';
  resourceID: string;
  navigation: NativeStackNavigationProp<CommonStackParamList>;
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
