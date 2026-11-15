import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {OobeLocation} from '#src/Enums/OobeLocation';
import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {OnboardingMode} from '#src/Types/RouteParams';

export type OobeStackParamList = CommonStackParamList & {
  OobeWelcomeScreen: undefined;
  OobeLocationScreen: undefined;
  // serverUrl is the server to start on; defaults to the active session's.
  OobeServerScreen: {mode: OnboardingMode; serverUrl?: string; location?: OobeLocation};
  OobeConductScreen: {mode: OnboardingMode; serverUrl: string};
  OobeAccountScreen: {mode: OnboardingMode; serverUrl: string};
  LoginScreen: {serverUrl?: string; username?: string; mode?: OnboardingMode} | undefined;
  OobeFinishScreen: undefined;
  RegisterScreen: {serverUrl?: string; mode?: OnboardingMode} | undefined;
  OobePermissionsScreen: undefined;
  OobePreregistrationScreen: undefined;
  OobeScheduleDayScreen: undefined;
};

export enum OobeStackComponents {
  oobeWelcomeScreen = 'OobeWelcomeScreen',
  oobeLocationScreen = 'OobeLocationScreen',
  oobeServerScreen = 'OobeServerScreen',
  oobeConductScreen = 'OobeConductScreen',
  oobeAccountScreen = 'OobeAccountScreen',
  oobeRegisterScreen = 'RegisterScreen',
  oobeFinishScreen = 'OobeFinishScreen',
  oobeLoginScreen = 'LoginScreen',
  oobePermissionsScreen = 'OobePermissionsScreen',
  oobePreregistrationScreen = 'OobePreregistrationScreen',
  oobeScheduleDayScreen = 'OobeScheduleDayScreen',
}

export const useOobeStack = () => useNavigation<StackNavigationProp<OobeStackParamList>>();
