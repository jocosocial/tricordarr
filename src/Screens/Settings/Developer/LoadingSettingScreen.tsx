import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';

export const LoadingSettingScreen = () => {
  return (
    <AppView>
      <LoadingView />
    </AppView>
  );
};
