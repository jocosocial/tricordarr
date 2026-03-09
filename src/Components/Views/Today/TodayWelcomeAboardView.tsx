import React from 'react';

import {TodayWelcomeAboardCard} from '#src/Components/Cards/MainScreen/TodayWelcomeAboardCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';

export const TodayWelcomeAboardView = () => {
  const {preRegistrationMode} = usePreRegistration();
  const {appConfig} = useConfig();

  if (preRegistrationMode || appConfig.dismissWelcomeAboard) {
    return <></>;
  }

  return (
    <PaddedContentView>
      <TodayWelcomeAboardCard />
    </PaddedContentView>
  );
};
