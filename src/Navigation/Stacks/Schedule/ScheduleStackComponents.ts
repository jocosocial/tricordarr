import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';

export type ScheduleStackParamList = CommonStackParamList & {};

export const useScheduleStackNavigation = () => useNavigation<StackNavigationProp<ScheduleStackParamList>>();

export const useScheduleStackRoute = () => useRoute<RouteProp<ScheduleStackParamList>>();
