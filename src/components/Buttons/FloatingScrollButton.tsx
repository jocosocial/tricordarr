import React from 'react';
import {View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {FloatingScrollButtonPosition} from '#src/Types';

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
    ...(displayPosition === 'bottom' ? {bottom: styleDefaults.marginSize * 2} : undefined),
    ...(displayPosition === 'raised' ? {bottom: styleDefaults.marginSize * 5} : undefined),
  };
  return (
    <View style={style} pointerEvents={'box-none'}>
      <IconButton icon={icon} size={30} onPress={onPress} mode={'contained-tonal'} />
    </View>
  );
};
