import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {OobeWelcomeScreen} from '#src/Screens/OOBE/OobeWelcomeScreen';
import {OobeServerScreen} from '#src/Screens/OOBE/OobeServerScreen';
import {OobeConductScreen} from '#src/Screens/OOBE/OobeConductScreen';
import {OobeFinishScreen} from '#src/Screens/OOBE/OobeFinishScreen';
import {OobeAccountScreen} from '#src/Screens/OOBE/OobeAccountScreen';
import {LoginScreen} from '#src/Screens/Settings/Account/LoginScreen';
import {OobeRegisterScreen} from '#src/Screens/Settings/Account/RegisterScreen';
import {OobePermissionsScreen} from '#src/Screens/OOBE/OobePermissionsScreen';
import {CommonScreens, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {MainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {OobePreregistrationScreen} from '#src/Screens/OOBE/OobePreregistrationScreen';
import {OobeUserDataScreen} from '#src/Screens/OOBE/OobeUserDataScreen';
import {ScheduleDayScreen} from '#src/Screens/Schedule/ScheduleDayScreen';

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
