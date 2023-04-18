import {IconButton} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useAppTheme} from '../../styles/Theme';
import {AppIcons} from '../../libraries/Enums/Icons';

interface FloatingScrollButtonProps {
  onPress: () => void;
}

/**
 * Button to float above content and give the user something to jump to the bottom.
 */
export const FloatingScrollButton = ({onPress}: FloatingScrollButtonProps) => {
  const {commonStyles} = useStyles();
  const style = {
    ...commonStyles.flexRow,
    ...commonStyles.justifyCenter,
    ...commonStyles.fullWidth,
    ...commonStyles.backgroundTransparent,
    ...commonStyles.positionAbsolute,
    bottom: 64, // this may not behave as expected
  };
  return (
    <View style={style}>
      <IconButton icon={AppIcons.scrollDown} size={30} onPress={onPress} mode={'contained-tonal'} />
    </View>
  );
};
