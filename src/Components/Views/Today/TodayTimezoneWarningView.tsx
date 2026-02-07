import React from 'react';

import {TimezoneWarningCard} from '#src/Components/Cards/MainScreen/TimezoneWarningCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';

export const TodayTimezoneWarningView = () => {
  const {preRegistrationMode} = usePreRegistration();
  const {showTimeZoneWarning} = useCruise();
  const {appConfig} = useConfig();

  if ((!showTimeZoneWarning && !appConfig.forceShowTimezoneWarning) || preRegistrationMode) {
    return <></>;
  }

  return (
    <PaddedContentView>
      <TimezoneWarningCard />
    </PaddedContentView>
  );
};
