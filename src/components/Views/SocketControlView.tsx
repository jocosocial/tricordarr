import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useAppTheme} from '../../styles/Theme';
import ReconnectingWebSocket from 'reconnecting-websocket';

interface SocketControlViewProps {
  title: string;
  websocket?: ReconnectingWebSocket;
}

export const SocketControlView = ({title, websocket}: SocketControlViewProps) => {
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
        <PrimaryActionButton buttonText={'Open'} onPress={() => console.log('open')} />
        <PrimaryActionButton
          buttonColor={theme.colors.twitarrNegativeButton}
          buttonText={'Close'}
          onPress={() => console.log('close')}
        />
      </View>
    </View>
  );
};
