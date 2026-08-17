import React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AppIcons} from '#src/Enums/Icons';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/Main/MainStackComponents';

interface BoardgameGuideFABProps {
  showLabel?: boolean;
}

export const BoardgameGuideFAB = (props: BoardgameGuideFABProps) => {
  const mainStack = useMainStack();
  return (
    <BaseFAB
      onPress={() => mainStack.push(MainStackComponents.boardgameRecommendScreen)}
      label={'Game Guide'}
      showLabel={props.showLabel}
      icon={AppIcons.games}
    />
  );
};
