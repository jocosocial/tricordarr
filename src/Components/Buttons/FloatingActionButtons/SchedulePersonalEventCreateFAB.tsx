import React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/Schedule/ScheduleStackComponents';

export const SchedulePersonalEventCreateFAB = () => {
  const navigation = useScheduleStackNavigation();
  return (
    <BaseFAB
      onPress={() => navigation.push(CommonStackComponents.personalEventCreateScreen, {})}
      icon={AppIcons.eventCreate}
      label={'New Event'}
      testID={'personalEventCreate-fab'}
    />
  );
};
