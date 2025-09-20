import React from 'react';

import {EventCardMarkerView} from '#src/Components/Views/Schedule/EventCardMarkerView';
import {useAppTheme} from '#src/Styles/Theme';

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
