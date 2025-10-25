import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

interface HeaderDayPlannerButtonProps {
  cruiseDay?: number;
}

export const HeaderDayPlannerButton = ({cruiseDay}: HeaderDayPlannerButtonProps) => {
  const commonNavigation = useCommonStack();

  return (
    <Item
      title={'Day Planner'}
      iconName={AppIcons.personalEvent}
      onPress={() => commonNavigation.push(CommonStackComponents.scheduleDayPlannerScreen, {cruiseDay})}
    />
  );
};
