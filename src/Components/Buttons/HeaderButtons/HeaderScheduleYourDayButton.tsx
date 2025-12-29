import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';

export const HeaderScheduleYourDayButton = () => {
  const {
    eventFavoriteFilter,
    setEventFavoriteFilter,
    eventPersonalFilter,
    setEventPersonalFilter,
    eventLfgJoinedFilter,
    setEventLfgJoinedFilter,
    eventLfgOwnedFilter,
    setEventLfgOwnedFilter,
    eventLfgOpenFilter,
    setEventLfgOpenFilter,
    setEventTypeFilter,
  } = useFilter();
  const {appConfig} = useConfig();
  const {theme} = useAppTheme();

  const yourDayActiveFilter =
    eventFavoriteFilter &&
    eventPersonalFilter &&
    eventLfgJoinedFilter &&
    eventLfgOwnedFilter &&
    (appConfig.schedule.eventsShowOpenLfgs ? eventLfgOpenFilter : true);

  const toggleYourDay = () => {
    if (yourDayActiveFilter) {
      setEventFavoriteFilter(false);
      setEventPersonalFilter(false);
      setEventLfgJoinedFilter(false);
      setEventLfgOwnedFilter(false);
      if (appConfig.schedule.eventsShowOpenLfgs) {
        setEventLfgOpenFilter(false);
      }
      setEventTypeFilter('');
    } else {
      setEventFavoriteFilter(true);
      setEventPersonalFilter(true);
      setEventLfgJoinedFilter(true);
      setEventLfgOwnedFilter(true);
      if (appConfig.schedule.eventsShowOpenLfgs) {
        setEventLfgOpenFilter(true);
      }
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
