import * as React from 'react';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useChatStack} from '#src/Navigation/Stacks/ChatStackNavigator';
import {ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';

interface ChatFABGroupProps {
  showLabel?: boolean;
}

export const ChatFABGroup = (props: ChatFABGroupProps) => {
  const chatNavigation = useChatStack();
  const {asModerator, asTwitarrTeam} = usePrivilege();

  const actions = [
    FabGroupAction({
      icon: AppIcons.seamailCreate,
      label: 'New Seamail',
      onPress: () =>
        chatNavigation.push(CommonStackComponents.seamailCreateScreen, {
          initialAsModerator: asModerator,
          initialAsTwitarrTeam: asTwitarrTeam,
        }),
    }),
    FabGroupAction({
      icon: AppIcons.krakentalkCreate,
      label: 'New Call',
      onPress: () => chatNavigation.push(ChatStackScreenComponents.krakentalkCreateScreen),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={'Chat'} icon={AppIcons.chat} showLabel={props.showLabel} />;
};
