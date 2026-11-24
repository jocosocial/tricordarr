import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {LfgListEndpoint} from '#src/Types';
import {WithIntent, WithScrollToTopIntent} from '#src/Types/RouteParams';

export type LfgStackParamList = CommonStackParamList & {
  LfgListScreen: WithScrollToTopIntent<
    WithIntent<{
      endpoint?: LfgListEndpoint;
      onlyNew?: boolean;
      cruiseDay?: number;
    }>
  >;
  LfgSearchScreen: {
    endpoint: LfgListEndpoint;
  };
};

export enum LfgStackComponents {
  lfgListScreen = 'LfgListScreen',
  lfgCreateScreen = 'LfgCreateScreen',
  lfgSearchScreen = 'LfgSearchScreen',
}

export const useLFGStackNavigation = () => useNavigation<StackNavigationProp<LfgStackParamList>>();

export const useLFGStackRoute = () => useRoute<RouteProp<LfgStackParamList>>();

/**
 * Scroll-to-top filter for the LFG list screen when the list that just changed (joined, left,
 * edited) is showing. All includes the user's joined LFGs, so it counts alongside Joined.
 */
export const lfgJoinedListScrollFilter: {key: string; anyOf: LfgListEndpoint[]} = {
  key: 'endpoint',
  anyOf: ['all', 'joined'],
};
