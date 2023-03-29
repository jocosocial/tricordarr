import React from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface NavigationListItemProps {
  title: string;
  description: string;
  navComponent: string;
}

export const NavigationListItem = ({title, description, navComponent}: NavigationListItemProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <List.Item title={title} description={description} onPress={() => navigation.push(navComponent, {title: title})} />
  );
};
