import React from 'react';
import {BaseFAB} from './BaseFAB.tsx';
import {useMainStack} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {MainStackComponents} from '../../../libraries/Enums/Navigation.ts';

interface PhotostreamFABProps {
  showLabel?: boolean;
}

export const PhotostreamFAB = (props: PhotostreamFABProps) => {
  const mainStack = useMainStack();
  return (
    <BaseFAB
      onPress={() => mainStack.push(MainStackComponents.photostreamImageCreateScreen)}
      label={props.showLabel ? 'New Post' : undefined}
    />
  );
};
