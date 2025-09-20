import {AppIcons} from '#src/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import React from 'react';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {useAppTheme} from '#src/Styles/Theme';

export const HeaderScheduleYourDayButton = () => {
  const {
    eventFavoriteFilter,
    setEventFavoriteFilter,
    eventPersonalFilter,
    setEventPersonalFilter,
    eventLfgFilter,
    setEventLfgFilter,
    setEventTypeFilter,
  } = useFilter();
  const theme = useAppTheme();

  const yourDayActiveFilter = eventFavoriteFilter && eventPersonalFilter && eventLfgFilter;

  const toggleYourDay = () => {
    if (yourDayActiveFilter) {
      setEventFavoriteFilter(false);
      setEventPersonalFilter(false);
      setEventLfgFilter(false);
      setEventTypeFilter('');
    } else {
      setEventFavoriteFilter(true);
      setEventPersonalFilter(true);
      setEventLfgFilter(true);
      setEventTypeFilter('');
    }
  };

  return (
    <Item
      title={'Your Day'}
      color={yourDayActiveFilter ? theme.colors.twitarrNeutralButton : undefined}
      iconName={AppIcons.personalEvent}
      onPress={toggleYourDay}
    />
  );
};
