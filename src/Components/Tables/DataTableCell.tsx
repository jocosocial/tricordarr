import React, {PropsWithChildren} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {DataTable} from 'react-native-paper';

import {useClipboard} from '#src/Hooks/useClipboard';

interface Props extends PropsWithChildren {
  value?: string | number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Generic DataTable.Cell component that builds in some default behavior that many
 * bits of the app use. Specifically, long-press to copy to clipboard.
 */
export const DataTableCell = (props: Props) => {
  const {setString} = useClipboard();
  return (
    <DataTable.Cell
      onPress={props.onPress}
      onLongPress={props.value ? () => setString(String(props.value)) : undefined}
      style={props.style}>
      {props.value}
      {props.children}
    </DataTable.Cell>
  );
};
