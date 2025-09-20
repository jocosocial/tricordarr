import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {OobeWelcomeScreen} from '../../Screens/OOBE/OobeWelcomeScreen.tsx';
import {OobeServerScreen} from '../../Screens/OOBE/OobeServerScreen.tsx';
import {OobeConductScreen} from '../../Screens/OOBE/OobeConductScreen.tsx';
import {OobeFinishScreen} from '../../Screens/OOBE/OobeFinishScreen.tsx';
import {OobeAccountScreen} from '../../Screens/OOBE/OobeAccountScreen.tsx';
import {LoginScreen} from '../../Screens/Settings/Account/LoginScreen.tsx';
import {OobeRegisterScreen} from '../../Screens/Settings/Account/RegisterScreen.tsx';
import {OobePermissionsScreen} from '../../Screens/OOBE/OobePermissionsScreen.tsx';
import {CommonScreens, CommonStackParamList} from '../CommonScreens.tsx';
import {MainStack} from './MainStackNavigator.tsx';
import {OobePreregistrationScreen} from '../../Screens/OOBE/OobePreregistrationScreen.tsx';
import {OobeUserDataScreen} from '../../Screens/OOBE/OobeUserDataScreen.tsx';
import {ScheduleDayScreen} from '../../Screens/Schedule/ScheduleDayScreen.tsx';

export type OobeStackParamList = CommonStackParamList & {
  OobeWelcomeScreen: undefined;
  OobeServerScreen: undefined;
  OobeConductScreen: undefined;
  OobeAccountScreen: undefined;
  LoginScreen: undefined;
  OobeFinishScreen: undefined;
  RegisterScreen: undefined;
  OobePermissionsScreen: undefined;
  OobePreregistrationScreen: undefined;
  OobeUserDataScreen: undefined;
  OobeScheduleDayScreen: {
    oobe?: boolean;
  };
};

export enum OobeStackComponents {
  oobeWelcomeScreen = 'OobeWelcomeScreen',
  oobeServerScreen = 'OobeServerScreen',
  oobeConductScreen = 'OobeConductScreen',
  oobeAccountScreen = 'OobeAccountScreen',
  oobeRegisterScreen = 'RegisterScreen',
  oobeFinishScreen = 'OobeFinishScreen',
  oobeLoginScreen = 'LoginScreen',
  oobePermissionsScreen = 'OobePermissionsScreen',
  oobePreregistrationScreen = 'OobePreregistrationScreen',
  oobeUserDataScreen = 'OobeUserDataScreen',
  oobeScheduleDayScreen = 'OobeScheduleDayScreen',
}

export const OobeStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<OobeStackParamList>();

  return (
    <Stack.Navigator
      initialRouteName={OobeStackComponents.oobeWelcomeScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={OobeStackComponents.oobeWelcomeScreen}
        component={OobeWelcomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeServerScreen}
        component={OobeServerScreen}
        options={{title: 'Server URL'}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeConductScreen}
        component={OobeConductScreen}
        options={{title: 'Code of Conduct'}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeAccountScreen}
        component={OobeAccountScreen}
        options={{title: 'Account'}}
      />
      <Stack.Screen name={OobeStackComponents.oobeLoginScreen} component={LoginScreen} options={{title: 'Login'}} />
      <Stack.Screen
        name={OobeStackComponents.oobeRegisterScreen}
        component={OobeRegisterScreen}
        options={{title: 'Register'}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobePermissionsScreen}
        component={OobePermissionsScreen}
        options={{title: 'Permissions'}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeFinishScreen}
        component={OobeFinishScreen}
        options={{title: 'Finish'}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobePreregistrationScreen}
        component={OobePreregistrationScreen}
        options={{title: 'Pre-Registration'}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeUserDataScreen}
        component={OobeUserDataScreen}
        options={{title: 'User Data'}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeScheduleDayScreen}
        component={ScheduleDayScreen}
        options={{title: 'Schedule'}}
      />
      {CommonScreens(Stack as typeof MainStack)}
    </Stack.Navigator>
  );
};

export const useOobeStack = () => useNavigation<NativeStackNavigationProp<OobeStackParamList>>();
