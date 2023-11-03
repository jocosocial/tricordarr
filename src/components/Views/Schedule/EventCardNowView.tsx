import React from 'react';
import {EventCardMarkerView} from './EventCardMarkerView';
import {useAppTheme} from '../../../styles/Theme';

export const EventCardNowView = () => {
  const theme = useAppTheme();
  return (
    <EventCardMarkerView
      backgroundColor={theme.colors.twitarrPositiveButton}
      color={theme.colors.onTwitarrPositiveButton}
      label={'Now'}
    />
  );
};
