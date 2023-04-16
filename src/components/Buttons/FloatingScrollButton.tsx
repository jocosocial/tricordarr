import {IconButton} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useAppTheme} from '../../styles/Theme';

interface FloatingScrollButtonProps {
  onPress: () => void;
}

export const FloatingScrollButton = ({onPress}: FloatingScrollButtonProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  return (
    <View
      style={{
        ...commonStyles.flexRow,
        ...commonStyles.justifyCenter,
        backgroundColor: 'transparent',
        width: '100%',
        position: 'absolute',
        bottom: 64,
      }}>
      <IconButton
        icon="arrow-down-circle"
        size={30}
        onPress={onPress}
        mode={'contained-tonal'}
        // containerColor={theme.colors.background}
        // style={{ position: 'absolute', bottom: 20, right: 20 }}
      />
    </View>
  );
};
