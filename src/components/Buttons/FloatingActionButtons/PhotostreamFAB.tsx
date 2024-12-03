import React from 'react';
import {BaseFAB} from './BaseFAB.tsx';
import {MainStackComponents, useMainStack} from '../../Navigation/Stacks/MainStackNavigator.tsx';

interface PhotostreamFABProps {
  showLabel?: boolean;
}

export const PhotostreamFAB = (props: PhotostreamFABProps) => {
  const mainStack = useMainStack();
  return (
    <BaseFAB
      onPress={() => mainStack.push(MainStackComponents.photostreamImageCreateScreen)}
      label={'New Post'}
      showLabel={props.showLabel}
    />
  );
};
