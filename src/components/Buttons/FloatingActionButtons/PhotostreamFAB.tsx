import React from 'react';
import {BaseFAB} from './BaseFAB.tsx';
import {useMainStack} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {MainStackComponents} from '../../../libraries/Enums/Navigation.ts';

export const PhotostreamFAB = () => {
  const mainStack = useMainStack();
  return <BaseFAB onPress={() => mainStack.push(MainStackComponents.photostreamImageCreateScreen)} />;
};
