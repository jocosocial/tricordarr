import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useAppTheme} from '../../styles/Theme';

interface SocketControlViewProps {
  title: string;
  onReset: () => void;
  disabled: boolean;
}

export const SocketControlView = ({title, onReset, disabled}: SocketControlViewProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();

  return (
    <View
      style={{
        ...commonStyles.booleanSettingRowView,
        ...commonStyles.marginVerticalSmall,
      }}>
      <Text>{title}</Text>
      <View
        style={{
          ...commonStyles.flexRow,
          ...commonStyles.gapSmall,
        }}>
        <PrimaryActionButton
          disabled={disabled}
          buttonColor={theme.colors.twitarrNegativeButton}
          buttonText={'Reset'}
          onPress={onReset}
        />
      </View>
    </View>
  );
};
