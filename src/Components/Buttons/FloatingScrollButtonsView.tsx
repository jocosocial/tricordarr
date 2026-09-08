import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {FloatingScrollButton} from '#src/Components/Buttons/FloatingScrollButton';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface FloatingScrollAction {
  onPress: () => void;
  icon: IconSource;
  testID: string;
}

interface FloatingScrollButtonsViewProps {
  actions: FloatingScrollAction[];
  small?: boolean;
}

/**
 * Floating container that composes discrete FloatingScrollButtons for the given
 * scroll actions (e.g. up and/or down). Positioned absolutely within its nearest
 * positioned ancestor (the list wrapper View).
 */
export const FloatingScrollButtonsView = ({actions, small = false}: FloatingScrollButtonsViewProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();

  const styles = StyleSheet.create({
    container: {
      ...commonStyles.flexColumn,
      ...commonStyles.gapSmall,
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
      {actions.map(action => (
        <FloatingScrollButton
          key={action.testID}
          testID={action.testID}
          icon={action.icon}
          onPress={action.onPress}
          small={small}
        />
      ))}
    </View>
  );
};
