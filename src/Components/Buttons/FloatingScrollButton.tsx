import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

interface FloatingScrollButtonProps {
  onPress: () => void;
  icon?: IconSource;
  small?: boolean;
}

/**
 * Button to float above content and give the user something to jump to the top/bottom.
 * Positioned absolutely within its nearest positioned ancestor (the list wrapper View).
 */
export const FloatingScrollButton = ({
  onPress,
  icon = AppIcons.scrollDown,
  small = false,
}: FloatingScrollButtonProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();

  const styles = StyleSheet.create({
    container: {
      ...commonStyles.flexRow,
      ...commonStyles.backgroundTransparent,
      ...commonStyles.positionAbsolute,
      bottom: styleDefaults.marginSize,
      ...(appConfig.userPreferences.reverseSwipeOrientation
        ? {left: styleDefaults.marginSize / 2}
        : {right: styleDefaults.marginSize / 2}),
    },
  });

  return (
    <View style={styles.container} pointerEvents={'box-none'}>
      <IconButton icon={icon} size={small ? 15 : 30} onPress={onPress} mode={'contained-tonal'} />
    </View>
  );
};
