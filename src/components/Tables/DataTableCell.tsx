import {DataTable} from 'react-native-paper';
import React, {PropsWithChildren} from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import {StyleProp, ViewStyle} from 'react-native';

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
  return (
    <DataTable.Cell
      onPress={props.onPress}
      onLongPress={props.value ? () => Clipboard.setString(String(props.value)) : undefined}
      style={props.style}>
      {props.value}
      {props.children}
    </DataTable.Cell>
  );
};
