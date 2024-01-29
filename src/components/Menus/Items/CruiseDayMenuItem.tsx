import {TextStyle} from 'react-native';
import {Menu} from 'react-native-paper';
import React from 'react';

interface CruiseDayMenuItemProps {
  handleSelection: (i: number) => void;
  title: string;
  currentCruiseDay: number;
  itemCruiseDay: number;
}

export const CruiseDayMenuItem = ({
  handleSelection,
  title,
  currentCruiseDay,
  itemCruiseDay,
}: CruiseDayMenuItemProps) => {
  const titleStyle: TextStyle = {
    fontWeight: currentCruiseDay === itemCruiseDay ? 'bold' : 'normal',
  };
  return <Menu.Item titleStyle={titleStyle} title={title} onPress={() => handleSelection(itemCruiseDay)} />;
};
