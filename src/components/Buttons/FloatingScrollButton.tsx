import {IconButton} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {AppIcons} from '../../libraries/Enums/Icons';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {FloatingScrollButtonPosition} from '../../libraries/Types';

interface FloatingScrollButtonProps {
  onPress: () => void;
  icon?: IconSource;
  displayPosition?: FloatingScrollButtonPosition;
}

/**
 * Button to float above content and give the user something to jump to the bottom.
 */
export const FloatingScrollButton = ({
  onPress,
  icon = AppIcons.scrollDown,
  displayPosition = 'bottom',
}: FloatingScrollButtonProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const style = {
    ...commonStyles.flexRow,
    ...commonStyles.justifyCenter,
    ...commonStyles.fullWidth,
    ...commonStyles.backgroundTransparent,
    ...commonStyles.positionAbsolute,
    ...(displayPosition === 'bottom' ? {bottom: styleDefaults.marginSize} : undefined),
    ...(displayPosition === 'raised' ? {bottom: 80} : undefined),
  };
  return (
    <View style={style} pointerEvents={'box-none'}>
      <IconButton icon={icon} size={30} onPress={onPress} mode={'contained-tonal'} />
    </View>
  );
};
