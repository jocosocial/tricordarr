import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';

import {ChatStackParamList} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {ForumStackParamList} from '#src/Navigation/Stacks/Forum/ForumStackComponents';
import {LfgStackParamList} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {ScheduleStackParamList} from '#src/Navigation/Stacks/Schedule/ScheduleStackComponents';

/**
 * This is where we define the root tabs and associate each one with its relevant
 * navigation param list.
 */
export type BottomTabParamList = {
  HomeTab: NavigatorScreenParams<MainStackParamList>;
  SeamailTab: NavigatorScreenParams<ChatStackParamList>;
  ScheduleTab: NavigatorScreenParams<ScheduleStackParamList>;
  ForumsTab: NavigatorScreenParams<ForumStackParamList>;
  LfgTab: NavigatorScreenParams<LfgStackParamList>;
};

export enum BottomTabComponents {
  homeTab = 'HomeTab',
  seamailTab = 'SeamailTab',
  forumsTab = 'ForumsTab',
  scheduleTab = 'ScheduleTab',
  lfgTab = 'LfgTab',
}

export const useBottomTabNavigator = () => useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
