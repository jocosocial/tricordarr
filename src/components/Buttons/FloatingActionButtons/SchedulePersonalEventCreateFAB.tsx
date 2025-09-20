import React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/ScheduleStackNavigator';

export const SchedulePersonalEventCreateFAB = () => {
  const navigation = useScheduleStackNavigation();
  return (
    <BaseFAB
      onPress={() => navigation.push(CommonStackComponents.personalEventCreateScreen, {})}
      icon={AppIcons.eventCreate}
      label={'New Event'}
    />
  );
};
