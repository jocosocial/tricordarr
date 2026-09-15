import React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/Main/MainStackComponents';

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
      testID={'photostreamCreate-fab'}
    />
  );
};
