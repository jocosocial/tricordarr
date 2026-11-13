import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {OobeLocation} from '#src/Enums/OobeLocation';
import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {WithIntent} from '#src/Types/RouteParams';

export type OobeStackParamList = CommonStackParamList & {
  OobeWelcomeScreen: undefined;
  OobeLocationScreen: undefined;
  OobeServerScreen: {location?: OobeLocation} | undefined;
  OobeConductScreen: undefined;
  OobeAccountScreen: undefined;
  LoginScreen: undefined;
  OobeFinishScreen: undefined;
  RegisterScreen: undefined;
  OobePermissionsScreen: undefined;
  OobePreregistrationScreen: WithIntent<{}, 'onboarding'>;
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
