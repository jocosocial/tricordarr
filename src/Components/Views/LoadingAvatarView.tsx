import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface LoadingAvatarViewProps {
  size?: number;
}

export const LoadingAvatarView = ({size}: LoadingAvatarViewProps) => {
  const {styleDefaults} = useStyles();
  const avatarSize = size ?? styleDefaults.avatarSize;

  const styles = StyleSheet.create({
    container: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size={'small'} />
    </View>
  );
};

