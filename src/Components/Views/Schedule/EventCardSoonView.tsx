import React from 'react';
import {StyleSheet} from 'react-native';

import {EventCardMarkerView} from '#src/Components/Views/Schedule/EventCardMarkerView';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

const markerBorderStyle = StyleSheet.create({
  rightBorder: {
    borderRightWidth: 1,
    borderRightColor: 'black',
  },
});

export interface EventCardSoonViewProps {
  /** When true (e.g. soon marker on a gold card), adds 1px black right border for contrast. */
  showMarkerBorder?: boolean;
}

export const EventCardSoonView = ({showMarkerBorder}: EventCardSoonViewProps) => {
  const {theme} = useAppTheme();
  return (
    <EventCardMarkerView
      backgroundColor={theme.colors.twitarrYellow}
      color={theme.colors.onTwitarrYellow}
      label={'Soon'}
      style={showMarkerBorder ? markerBorderStyle.rightBorder : undefined}
    />
  );
};
