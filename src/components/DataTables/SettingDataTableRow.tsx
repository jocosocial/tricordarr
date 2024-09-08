import React, {PropsWithChildren} from 'react';
import {DataTable} from 'react-native-paper';
import {useStyles} from '../Context/Contexts/StyleContext';
import Clipboard from '@react-native-clipboard/clipboard';

interface SettingDataTableRowProps {
  title: string;
  value?: string;
  onPress?: () => void;
  reverseSplit?: boolean;
}

export const SettingDataTableRow = ({
  title,
  value,
  onPress,
  children,
  reverseSplit = false,
}: PropsWithChildren<SettingDataTableRowProps>) => {
  const {commonStyles} = useStyles();
  return (
    <DataTable.Row
      style={{
        ...commonStyles.paddingHorizontalZero,
        ...commonStyles.borderBottomZero,
      }}
      key={title}
      onPress={onPress}>
      <DataTable.Cell style={reverseSplit ? commonStyles.flex2 : undefined}>{title}</DataTable.Cell>
      <DataTable.Cell
        style={reverseSplit ? undefined : commonStyles.flex2}
        onLongPress={value ? () => Clipboard.setString(value) : undefined}>
        {value}
        {children}
      </DataTable.Cell>
    </DataTable.Row>
  );
};
