import React from 'react';

import {EventCardMarkerView} from '#src/Components/Views/Schedule/EventCardMarkerView';
import {useAppTheme} from '#src/Styles/Theme';

export const EventCardSoonView = () => {
  const theme = useAppTheme();
  return (
    <EventCardMarkerView
      backgroundColor={theme.colors.twitarrYellow}
      color={theme.colors.onTwitarrYellow}
      label={'Soon'}
    />
  );
};
