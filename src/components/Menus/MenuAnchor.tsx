import {AppIcons} from '#src/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import React from 'react';
import {useAppTheme} from '#src/Styles/Theme';

interface MenuAnchorProps {
  active?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  iconName?: string;
  title: string;
}

export const MenuAnchor = ({title, active, onPress, onLongPress, iconName = AppIcons.menu}: MenuAnchorProps) => {
  const theme = useAppTheme();
  return (
    <Item
      title={title}
      color={active ? theme.colors.twitarrNeutralButton : undefined}
      iconName={iconName}
      onPress={onPress}
      onLongPress={onLongPress}
    />
  );
};
