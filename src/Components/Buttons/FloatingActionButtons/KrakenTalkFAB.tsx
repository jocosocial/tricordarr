import * as React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AppIcons} from '#src/Enums/Icons';
import {useChatStack} from '#src/Navigation/Stacks/ChatStackNavigator';
import {ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';

interface KrakenTalkFABProps {
  showLabel?: boolean;
}

export const KrakenTalkFAB = (props: KrakenTalkFABProps) => {
  const chatNavigation = useChatStack();

  return (
    <BaseFAB
      icon={AppIcons.krakentalkCreate}
      onPress={() => chatNavigation.push(ChatStackScreenComponents.krakentalkCreateScreen)}
      label={'New Call'}
      showLabel={props.showLabel}
    />
  );
};
