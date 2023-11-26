import {StyleSheet} from 'react-native';
import {useAppTheme} from '../../../styles/Theme';
import React from 'react';
import {AnimatedFAB} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';

interface SingleFABProps {
  backgroundColor?: string;
  color?: string;
  onPress?: () => void;
}

export const ForumThreadFAB = ({backgroundColor, color, onPress}: SingleFABProps) => {
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    fabGroup: {
      backgroundColor: backgroundColor ? backgroundColor : theme.colors.inverseSurface,
      bottom: 16,
      right: 16,
      position: 'absolute',
    },
  });
  return (
    <AnimatedFAB
      icon={AppIcons.new}
      label={'New Thread'}
      onPress={onPress}
      visible={true}
      // animateFrom={'right'}
      style={styles.fabGroup}
      extended={true}
      color={color ? color : theme.colors.inverseOnSurface}
    />
  );
};
