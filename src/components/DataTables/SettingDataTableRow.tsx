import React, {PropsWithChildren} from 'react';
import {DataTable} from 'react-native-paper';
import {useStyles} from '../Context/Contexts/StyleContext';

interface SettingDataTableRowProps {
  title: string;
  value?: string;
  onPress?: () => void;
}

export const SettingDataTableRow = ({title, value, onPress, children}: PropsWithChildren<SettingDataTableRowProps>) => {
  const {commonStyles} = useStyles();
  return (
    <DataTable.Row
      style={{
        ...commonStyles.paddingHorizontalZero,
        ...commonStyles.borderBottomZero,
      }}
      key={title}
      onPress={onPress}>
      <DataTable.Cell>{title}</DataTable.Cell>
      <DataTable.Cell style={commonStyles.flex2}>
        {value}
        {children}
      </DataTable.Cell>
    </DataTable.Row>
  );
};
