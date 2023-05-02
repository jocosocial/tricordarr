import React from 'react';
import {ColorValue} from 'react-native';
import {AndroidColor} from '@notifee/react-native';
import {AppIcon} from './AppIcon';
import {useAppTheme} from '../../styles/Theme';

interface SocketStatusIndicatorProps {
  status?: number;
}

// This may not be actively used anymore.
export const WebSocketStatusIndicator = ({status}: SocketStatusIndicatorProps) => {
  const theme = useAppTheme();
  let color: ColorValue = AndroidColor.GRAY;

  if (status === 0) {
    color = AndroidColor.YELLOW;
  } else if (status === 1) {
    color = theme.colors.twitarrPositiveButton;
  } else if (status !== undefined) {
    color = theme.colors.twitarrNegativeButton;
  }

  return <AppIcon color={color} icon={'circle-medium'} />;
};
