import React from 'react';

import {TimezoneWarningCard} from '#src/Components/Cards/MainScreen/TimezoneWarningCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';

export const TodayTimezoneWarningView = () => {
  const {showTimeZoneWarning} = useCruise();
  const {appConfig} = useConfig();

  if (!showTimeZoneWarning && !appConfig.forceShowTimezoneWarning) {
    return <></>;
  }

  return (
    <PaddedContentView>
      <TimezoneWarningCard />
    </PaddedContentView>
  );
};
