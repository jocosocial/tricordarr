import React from 'react';
import {List} from 'react-native-paper';

export const PermissionListItem = ({appPermission}) => {
  async function onPress() {
    const currentResult = await appPermission.check();
    const newResult = await appPermission.request();
    if (currentResult === newResult) {
      console.log('No change in permission');
    } else {
      console.log('Permissions changed');
      appPermission.onChange();
    }
  }

  return (
    <>
      <List.Item title={appPermission.title} description={appPermission.description} onPress={() => onPress()} />
    </>
  );
};
