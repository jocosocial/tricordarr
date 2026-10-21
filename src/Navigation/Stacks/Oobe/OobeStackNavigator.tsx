import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens} from '#src/Navigation/Stacks/Common/CommonScreens';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {OobeAccountScreen} from '#src/Screens/OOBE/OobeAccountScreen';
import {OobeConductScreen} from '#src/Screens/OOBE/OobeConductScreen';
import {OobeFinishScreen} from '#src/Screens/OOBE/OobeFinishScreen';
import {OobeLocationScreen} from '#src/Screens/OOBE/OobeLocationScreen';
import {OobePermissionsScreen} from '#src/Screens/OOBE/OobePermissionsScreen';
import {OobePreregistrationScreen} from '#src/Screens/OOBE/OobePreregistrationScreen';
import {OobeServerScreen} from '#src/Screens/OOBE/OobeServerScreen';
import {OobeWelcomeScreen} from '#src/Screens/OOBE/OobeWelcomeScreen';
import {LoginScreen} from '#src/Screens/Settings/Account/LoginScreen';
import {RegisterScreen} from '#src/Screens/Settings/Account/RegisterScreen';

export const OobeStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createStackNavigator<OobeStackParamList>();

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
        name={OobeStackComponents.oobeLocationScreen}
        component={OobeLocationScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeServerScreen}
        component={OobeServerScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeConductScreen}
        component={OobeConductScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeAccountScreen}
        component={OobeAccountScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen name={OobeStackComponents.oobeLoginScreen} component={LoginScreen} options={{headerShown: false}} />
      <Stack.Screen
        name={OobeStackComponents.oobeRegisterScreen}
        component={RegisterScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobePermissionsScreen}
        component={OobePermissionsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeFinishScreen}
        component={OobeFinishScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobePreregistrationScreen}
        component={OobePreregistrationScreen}
        options={{headerShown: false}}
      />
      {CommonScreens(Stack)}
    </Stack.Navigator>
  );
};
