import {HeaderCard} from '../../Cards/MainScreen/HeaderCard.tsx';
import {PaddedContentView} from '../Content/PaddedContentView.tsx';
import React from 'react';
import {EasterEggHeaderCard} from '../../Cards/MainScreen/EasterEggHeaderCard.tsx';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';

export const TodayHeaderView = () => {
  const {appConfig} = useConfig();
  return (
    <PaddedContentView padTop={true}>
      {appConfig.enableEasterEgg ? <EasterEggHeaderCard /> : <HeaderCard />}
    </PaddedContentView>
  );
};
