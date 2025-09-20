import React from 'react';

import {EasterEggHeaderCard} from '#src/Components/Cards/MainScreen/EasterEggHeaderCard';
import {HeaderCard} from '#src/Components/Cards/MainScreen/HeaderCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';

export const TodayHeaderView = () => {
  const {appConfig} = useConfig();
  return (
    <PaddedContentView padTop={true}>
      {appConfig.enableEasterEgg ? <EasterEggHeaderCard /> : <HeaderCard />}
    </PaddedContentView>
  );
};
