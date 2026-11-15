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
  OobeAccountScreen: {mode: OnboardingMode; serverUrl: string};
  LoginScreen: {serverUrl?: string; username?: string; mode?: OnboardingMode} | undefined;
  OobeFinishScreen: undefined;
  RegisterConductScreen: {serverUrl?: string; mode?: OnboardingMode} | undefined;
  RegisterScreen: {serverUrl?: string; mode?: OnboardingMode} | undefined;
  OobeSessionScreen: {mode: OnboardingMode};
  OobePermissionsScreen: undefined;
  OobePreregistrationScreen: undefined;
  OobeScheduleDayScreen: undefined;
};

export enum OobeStackComponents {
  oobeWelcomeScreen = 'OobeWelcomeScreen',
  oobeLocationScreen = 'OobeLocationScreen',
  oobeServerScreen = 'OobeServerScreen',
  oobeAccountScreen = 'OobeAccountScreen',
  oobeRegisterConductScreen = 'RegisterConductScreen',
  oobeRegisterScreen = 'RegisterScreen',
  oobeFinishScreen = 'OobeFinishScreen',
  oobeLoginScreen = 'LoginScreen',
  oobeSessionScreen = 'OobeSessionScreen',
  oobePermissionsScreen = 'OobePermissionsScreen',
  oobePreregistrationScreen = 'OobePreregistrationScreen',
  oobeScheduleDayScreen = 'OobeScheduleDayScreen',
}

export const useOobeStack = () => useNavigation<StackNavigationProp<OobeStackParamList>>();
