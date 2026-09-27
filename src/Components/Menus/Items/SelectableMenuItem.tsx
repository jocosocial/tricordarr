import React, {useEffect, useId, useRef} from 'react';
import {LayoutChangeEvent, StyleSheet} from 'react-native';
import {Menu} from 'react-native-paper';
import {IconSource} from 'react-native-paper/src/components/Icon';

import {useAppMenuScroll} from '#src/Components/Menus/AppMenu';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

// Static: doesn't depend on commonStyles, theme, or props.
const styles = StyleSheet.create({
  // Menu.Item's row otherwise packs leading icon/title/trailing icon tightly from the left, so
  // the trailing checkmark sits right after the title instead of at the item's right edge - its
  // horizontal position would drift with every item's title length. space-between pushes it to
  // the far edge of the row without touching the title's own (natural-width) sizing, which a
  // flex/flexBasis approach on the content wrapper would - that clips long titles instead.
  container: {
    justifyContent: 'space-between',
  },
});

interface SelectableMenuItemProps {
  selected?: boolean;
  title: string;
  onPress: () => void;
  leadingIcon?: IconSource;
  disabled?: boolean;
}

/**
 * Generic Menu item for selectable filters and such.
 */
export const SelectableMenuItem = (props: SelectableMenuItemProps) => {
  const {commonStyles} = useStyles();
  const id = useId();
  const {registerItem, unregisterItem} = useAppMenuScroll();
  const layoutRef = useRef({y: 0, height: 0});

  const handleLayout = (event: LayoutChangeEvent) => {
    const {y, height} = event.nativeEvent.layout;
    layoutRef.current = {y, height};
    registerItem(id, {y, height, selected: !!props.selected});
  };

  // Re-report on selection change without a new layout pass (e.g. selection toggled elsewhere).
  useEffect(() => {
    registerItem(id, {...layoutRef.current, selected: !!props.selected});
  }, [id, props.selected, registerItem]);

  useEffect(() => {
    return () => unregisterItem(id);
  }, [id, unregisterItem]);

  return (
    <Menu.Item
      title={props.title}
      style={props.selected ? commonStyles.surfaceVariant : undefined}
      containerStyle={styles.container}
      trailingIcon={props.selected ? AppIcons.check : undefined}
      onPress={props.onPress}
      leadingIcon={props.leadingIcon}
      disabled={props.disabled}
      onLayout={handleLayout}
    />
  );
};
