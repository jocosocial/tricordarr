import {HeaderCard} from '#src/Components/Cards/MainScreen/HeaderCard.tsx';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView.tsx';
import React from 'react';
import {EasterEggHeaderCard} from '#src/Components/Cards/MainScreen/EasterEggHeaderCard.tsx';
import {useConfig} from '#src/Components/Context/Contexts/ConfigContext.ts';

export const TodayHeaderView = () => {
  const {appConfig} = useConfig();
  return (
    <PaddedContentView padTop={true}>
      {appConfig.enableEasterEgg ? <EasterEggHeaderCard /> : <HeaderCard />}
    </PaddedContentView>
  );
};
