import React from 'react';

import {TodayPreRegistrationCard} from '#src/Components/Cards/MainScreen/TodayPreRegistrationCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';

export const TodayPreRegistrationView = () => {
  const {preRegistrationMode} = usePreRegistration();

  if (!preRegistrationMode) {
    return <></>;
  }

  return (
    <PaddedContentView>
      <TodayPreRegistrationCard />
    </PaddedContentView>
  );
};
