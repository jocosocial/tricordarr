import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {OobeWelcomeScreen} from '../../Screens/OOBE/OobeWelcomeScreen';
import {OobeServerScreen} from '../../Screens/OOBE/OobeServerScreen';
import {OobeConductScreen} from '../../Screens/OOBE/OobeConductScreen';
import {OobeFinishScreen} from '../../Screens/OOBE/OobeFinishScreen';
import {OobeAccountScreen} from '../../Screens/OOBE/OobeAccountScreen';
import {LoginScreen} from '../../Screens/Settings/Account/LoginScreen';
import {RegisterScreen} from '../../Screens/Settings/Account/RegisterScreen';
import {OobeNotificationsScreen} from '../../Screens/OOBE/OobeNotificationsScreen';
import {CommonScreens, CommonStackParamList} from '../CommonScreens';
import {MainStack} from './MainStackNavigator';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext.ts';

export type OobeStackParamList = CommonStackParamList & {
  OobeWelcomeScreen: undefined;
  OobeServerScreen: undefined;
  OobeConductScreen: undefined;
  OobeAccountScreen: undefined;
  LoginScreen: undefined;
  OobeFinishScreen: undefined;
  RegisterScreen: undefined;
  OobeNotificationsScreen: undefined;
};

export const OobeStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<OobeStackParamList>();
  const {setHasUnsavedWork} = useErrorHandler();

  return (
    <Stack.Navigator
      initialRouteName={OobeStackComponents.oobeWelcomeScreen}
      screenOptions={{...screenOptions, headerShown: true}}
      screenListeners={{
        state: () => {
          console.log('[OobeStackNavigator.tsx] Clearing unsaved work.');
          setHasUnsavedWork(false);
        },
      }}>
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
        component={RegisterScreen}
        options={{title: 'Register'}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeNotificationsScreen}
        component={OobeNotificationsScreen}
        options={{title: 'Notifications'}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeFinishScreen}
        component={OobeFinishScreen}
        options={{title: 'Finish'}}
      />
      {CommonScreens(Stack as typeof MainStack)}
    </Stack.Navigator>
  );
};

export const useOobeStack = () => useNavigation<NativeStackNavigationProp<OobeStackParamList>>();
