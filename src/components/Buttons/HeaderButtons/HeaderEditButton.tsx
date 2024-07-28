import {Item} from 'react-navigation-header-buttons';
import React from 'react';

interface HeaderButtonProps {
  onPress: () => void;
  iconName?: string;
}

export const HeaderEditButton = ({onPress, iconName}: HeaderButtonProps) => {
  return <Item title={'Edit'} iconName={iconName} onPress={onPress} />;
};
