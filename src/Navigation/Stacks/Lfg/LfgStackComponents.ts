import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {FezListEndpoints} from '#src/Types';
import {WithIntent, WithScrollToTopIntent} from '#src/Types/RouteParams';

export type LfgStackParamList = CommonStackParamList & {
  LfgListScreen: WithScrollToTopIntent<
    WithIntent<{
      endpoint: FezListEndpoints;
      onlyNew?: boolean;
      cruiseDay?: number;
    }>
  >;
  LfgSearchScreen: {
    endpoint: FezListEndpoints;
  };
};

export enum LfgStackComponents {
  lfgListScreen = 'LfgListScreen',
  lfgCreateScreen = 'LfgCreateScreen',
  lfgSearchScreen = 'LfgSearchScreen',
}

export const useLFGStackNavigation = () => useNavigation<StackNavigationProp<LfgStackParamList>>();

export const useLFGStackRoute = () => useRoute<RouteProp<LfgStackParamList>>();
