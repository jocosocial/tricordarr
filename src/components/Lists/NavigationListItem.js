import React from 'react';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export const NavigationListItem = ({title, description, navComponent}) => {
  const navigation = useNavigation();

  return (
    <List.Item title={title} description={description} onPress={() => navigation.push(navComponent, {title: title})} />
  );
};
