import {HeaderCard} from '../Cards/MainScreen/HeaderCard';
import {PaddedContentView} from './Content/PaddedContentView';
import React from 'react';
import {EasterEggHeaderCard} from '../Cards/MainScreen/EasterEggHeaderCard';
import {useConfig} from '../Context/Contexts/ConfigContext';

export const MainHeaderView = () => {
  const {appConfig} = useConfig();
  return (
    <PaddedContentView padTop={true}>
      {appConfig.enableEasterEgg ? <EasterEggHeaderCard /> : <HeaderCard />}
    </PaddedContentView>
  );
};
