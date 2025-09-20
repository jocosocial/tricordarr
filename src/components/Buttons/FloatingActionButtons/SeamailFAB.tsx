import * as React from 'react';
import {useChatStack} from '#src/Navigation/Stacks/ChatStackNavigator';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';

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
