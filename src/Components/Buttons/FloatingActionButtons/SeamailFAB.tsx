import * as React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useChatStack} from '#src/Navigation/Stacks/ChatStackNavigator';

interface SeamailFABProps {
  showLabel?: boolean;
}

export const SeamailFAB = (props: SeamailFABProps) => {
  const chatNavigation = useChatStack();
  const {asModerator, asTwitarrTeam} = usePrivilege();

  return (
    <BaseFAB
      onPress={() =>
        chatNavigation.push(CommonStackComponents.seamailCreateScreen, {
          initialAsModerator: asModerator,
          initialAsTwitarrTeam: asTwitarrTeam,
        })
      }
      label={'New Seamail'}
      showLabel={props.showLabel}
    />
  );
};
