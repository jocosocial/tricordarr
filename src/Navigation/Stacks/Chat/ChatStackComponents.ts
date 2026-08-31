import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {WithElevation, WithScrollToTopIntent} from '#src/Types/RouteParams';

export type ChatStackParamList = CommonStackParamList & {
  SeamailListScreen: WithElevation<
    WithScrollToTopIntent<{
      onlyNew?: boolean;
    }>
  >;
  SeamailSearchScreen: {
    forUser?: string;
  };
  KrakenTalkReceiveScreen: {
    callID: string;
    callerUserID: string;
    callerUsername: string;
  };
};

export enum ChatStackScreenComponents {
  seamailListScreen = 'SeamailListScreen',
  seamailSearchScreen = 'SeamailSearchScreen',
  krakenTalkReceiveScreen = 'KrakenTalkReceiveScreen',
}

export const useChatStack = () => useNavigation<StackNavigationProp<ChatStackParamList>>();
