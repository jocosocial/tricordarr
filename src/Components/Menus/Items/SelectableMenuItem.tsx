import React, {useEffect, useId, useRef} from 'react';
import {LayoutChangeEvent} from 'react-native';
import {Menu} from 'react-native-paper';
import {IconSource} from 'react-native-paper/src/components/Icon';

import {useAppMenuScroll} from '#src/Components/Menus/AppMenu';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

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
      trailingIcon={props.selected ? AppIcons.check : undefined}
      onPress={props.onPress}
      leadingIcon={props.leadingIcon}
      disabled={props.disabled}
      onLayout={handleLayout}
    />
  );
};
