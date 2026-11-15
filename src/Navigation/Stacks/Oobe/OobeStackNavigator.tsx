import {createStackNavigator} from '@react-navigation/stack';
import React, {useState} from 'react';

import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens} from '#src/Navigation/Stacks/Common/CommonScreens';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {OobeAccountScreen} from '#src/Screens/OOBE/OobeAccountScreen';
import {OobeFinishScreen} from '#src/Screens/OOBE/OobeFinishScreen';
import {OobeLocationScreen} from '#src/Screens/OOBE/OobeLocationScreen';
import {OobePermissionsScreen} from '#src/Screens/OOBE/OobePermissionsScreen';
import {OobePreregistrationScreen} from '#src/Screens/OOBE/OobePreregistrationScreen';
import {OobeServerScreen} from '#src/Screens/OOBE/OobeServerScreen';
import {OobeSessionScreen} from '#src/Screens/OOBE/OobeSessionScreen';
import {OobeWelcomeScreen} from '#src/Screens/OOBE/OobeWelcomeScreen';
import {LoginScreen} from '#src/Screens/Settings/Account/LoginScreen';
import {RegisterConductScreen} from '#src/Screens/Settings/Account/RegisterConductScreen';
import {RegisterScreen} from '#src/Screens/Settings/Account/RegisterScreen';

/**
 * The setup flow: first run, boarding from pre-registration, and adding an account. See
 * OnboardingMode. Entered at a specific screen for the latter two; first run starts at the welcome
 * screen. Every mode comes back in at the session step once its commit has changed the session and
 * remounted the navigators.
 */
export const OobeStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createStackNavigator<OobeStackParamList>();
  const {resumeMode} = useOobe();
  // Decided once per mount; the flag is cleared when the flow ends.
  const [resumingMode] = useState(resumeMode);
  const initialRouteName = resumingMode ? OobeStackComponents.oobeSessionScreen : OobeStackComponents.oobeWelcomeScreen;

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{...screenOptions, headerShown: true}}>
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
        name={OobeStackComponents.oobeAccountScreen}
        component={OobeAccountScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen name={OobeStackComponents.oobeLoginScreen} component={LoginScreen} options={{headerShown: false}} />
      <Stack.Screen
        name={OobeStackComponents.oobeRegisterConductScreen}
        component={RegisterConductScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeRegisterScreen}
        component={RegisterScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeSessionScreen}
        component={OobeSessionScreen}
        initialParams={resumingMode ? {mode: resumingMode} : undefined}
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
