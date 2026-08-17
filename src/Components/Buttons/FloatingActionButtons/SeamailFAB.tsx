import * as React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {useChatStack} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface SeamailFABProps {
  showLabel?: boolean;
}

export const SeamailFAB = (props: SeamailFABProps) => {
  const chatNavigation = useChatStack();
  const {asPrivilegedUser} = useElevation();

  return (
    <BaseFAB
      onPress={() =>
        chatNavigation.push(CommonStackComponents.seamailCreateScreen, {
          asPrivilegedUser,
        })
      }
      label={'New Seamail'}
      showLabel={props.showLabel}
    />
  );
};
