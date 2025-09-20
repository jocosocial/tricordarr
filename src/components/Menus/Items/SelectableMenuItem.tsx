import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {Menu} from 'react-native-paper';
import React from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {IconSource} from 'react-native-paper/src/components/Icon.tsx';

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
  return (
    <Menu.Item
      title={props.title}
      style={props.selected ? commonStyles.surfaceVariant : undefined}
      trailingIcon={props.selected ? AppIcons.check : undefined}
      onPress={props.onPress}
      leadingIcon={props.leadingIcon}
      disabled={props.disabled}
    />
  );
};
