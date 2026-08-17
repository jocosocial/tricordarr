import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {BottomTabParamList} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';

export type RootStackParamList = {
  OobeStackNavigator: NavigatorScreenParams<OobeStackParamList>;
  RootContentScreen: NavigatorScreenParams<BottomTabParamList>;
  // Lighter has to be here until I can figure out how to fullscreen a video
  LighterScreen: undefined;
};

export enum RootStackComponents {
  oobeNavigator = 'OobeStackNavigator',
  rootContentScreen = 'RootContentScreen',
  lighterScreen = 'LighterScreen',
}

export const useRootStack = () => useNavigation<StackNavigationProp<RootStackParamList>>();
