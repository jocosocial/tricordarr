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
  /** Anchor the stack above a bottom-right FAB instead of inside its footprint. Screens that render one pass true; the raised anchor sits at bottom = marginSize * 4 (80px), clearing the FAB's top edge at 72px. */
  raised?: boolean;
}

/**
 * Floating container that composes discrete FloatingScrollButtons for the given
 * scroll actions (e.g. up and/or down). Positioned absolutely within its nearest
 * positioned ancestor (the list wrapper View).
 *
 * Actions render top to bottom in the order given, so pass scroll-up before
 * scroll-down to keep the stack consistent. IconButton supplies its own small
 * margin, which is all the separation the stack needs.
 *
 * Pass raised when the screen also renders a bottom-right FAB, so the stack
 * clears it instead of collapsing into the FAB's footprint at the list ends.
 * Ignored in left-handed mode, where the stack is on the opposite side from the FAB.
 */
export const FloatingScrollButtonsView = ({actions, small = false, raised = false}: FloatingScrollButtonsViewProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();

  const leftHanded = appConfig.userPreferences.reverseSwipeOrientation;
  // The FAB sits on the right, so left-handed mode moves the stack to the left and no extra clearance is needed.
  const styles = StyleSheet.create({
    container: {
      ...commonStyles.flexColumn,
      ...commonStyles.backgroundTransparent,
      ...commonStyles.positionAbsolute,
      bottom: raised && !leftHanded ? styleDefaults.marginSize * 4 : styleDefaults.marginSize,
      ...(leftHanded ? {left: styleDefaults.marginSize / 2} : {right: styleDefaults.marginSize / 2}),
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
