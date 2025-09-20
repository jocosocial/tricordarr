import * as React from 'react';
import {useChatStack} from '#src/Components/Navigation/Stacks/ChatStackNavigator.tsx';
import {CommonStackComponents} from '#src/Components/Navigation/CommonScreens.tsx';
import {BaseFAB} from './BaseFAB.tsx';
import {usePrivilege} from '#src/Components/Context/Contexts/PrivilegeContext.ts';

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
