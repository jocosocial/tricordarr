import React from 'react';
import {EventCardMarkerView} from './EventCardMarkerView';
import {useAppTheme} from '../../../styles/Theme';

export const EventCardSoonView = () => {
  const theme = useAppTheme();
  return (
    <EventCardMarkerView
      backgroundColor={theme.colors.twitarrBannerColor}
      color={theme.colors.onTwitarrBannerColor}
      label={'Soon'}
    />
  );
};
