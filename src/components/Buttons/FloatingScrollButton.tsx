import {IconButton} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {AppIcons} from '../../libraries/Enums/Icons';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

interface FloatingScrollButtonProps {
  onPress: () => void;
  icon?: IconSource;
  displayPosition?: 'top' | 'bottom';
}

/**
 * Button to float above content and give the user something to jump to the bottom.
 */
export const FloatingScrollButton = ({
  onPress,
  icon = AppIcons.scrollDown,
  displayPosition = 'bottom',
}: FloatingScrollButtonProps) => {
  const {commonStyles} = useStyles();
  const style = {
    ...commonStyles.flexRow,
    ...commonStyles.justifyCenter,
    ...commonStyles.fullWidth,
    ...commonStyles.backgroundTransparent,
    ...commonStyles.positionAbsolute,
    ...(displayPosition === 'bottom' ? {bottom: 64} : undefined), // this may not behave as expected
    ...(displayPosition === 'top' ? {bottom: 64} : undefined), // this may not behave as expected
  };
  return (
    <View style={style}>
      <IconButton icon={icon} size={30} onPress={onPress} mode={'contained-tonal'} />
    </View>
  );
};
