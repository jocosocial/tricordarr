import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {NoDrawerParams, WithElevation, WithScrollToTopIntent} from '#src/Types/RouteParams';

export type ChatStackParamList = CommonStackParamList & {
  SeamailListScreen: WithElevation<
    WithScrollToTopIntent<
      NoDrawerParams & {
        onlyNew?: boolean;
      }
    >
  >;
  SeamailSearchScreen: {
    forUser?: string;
  };
  KrakenTalkReceiveScreen: {
    callID: string;
    callerUserID: string;
    callerUsername: string;
    /**
     * Answer as soon as the screen mounts. Set by the Answer action on the Android call
     * notification, so that button answers the call rather than just opening the app to a second
     * Answer button. Arrives as the string 'true' when it comes in through a deep link.
     */
    autoAnswer?: boolean | string;
  };
};

export enum ChatStackScreenComponents {
  seamailListScreen = 'SeamailListScreen',
  seamailSearchScreen = 'SeamailSearchScreen',
  krakenTalkReceiveScreen = 'KrakenTalkReceiveScreen',
}

export const useChatStack = () => useNavigation<StackNavigationProp<ChatStackParamList>>();
