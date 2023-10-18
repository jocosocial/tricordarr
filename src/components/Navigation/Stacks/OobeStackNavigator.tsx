import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {OobeWelcomeScreen} from '../../Screens/OOBE/OobeWelcomeScreen';
import {OobeServerScreen} from '../../Screens/OOBE/OobeServerScreen';
import {OobeConductScreen} from '../../Screens/OOBE/OobeConductScreen';
import {OobeFinishScreen} from '../../Screens/OOBE/OobeFinishScreen';
import {OobeRegisterScreen} from '../../Screens/OOBE/OobeRegisterScreen';
import {OobeLoginScreen} from '../../Screens/OOBE/OobeLoginScreen';
import {OobeHelpScreen} from '../../Screens/OOBE/OobeHelpScreen';

export type OobeStackParamList = {
  OobeWelcomeScreen: undefined;
  OobeServerScreen: undefined;
  OobeConductScreen: undefined;
  OobeRegisterScreen: undefined;
  OobeLoginScreen: undefined;
  OobeHelpScreen: undefined;
  OobeFinishScreen: undefined;
};

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
        options={{title: 'Welcome'}}
      />
      <Stack.Screen
        name={OobeStackComponents.oobeServerScreen}
        component={OobeServerScreen}
        options={{title: 'Server URL'}}
      />
      <Stack.Screen name={OobeStackComponents.oobeConductScreen} component={OobeConductScreen} options={{title: 'Code of Conduct'}} />
      <Stack.Screen name={OobeStackComponents.oobeRegisterScreen} component={OobeRegisterScreen} />
      <Stack.Screen name={OobeStackComponents.oobeLoginScreen} component={OobeLoginScreen} />
      <Stack.Screen name={OobeStackComponents.oobeHelpScreen} component={OobeHelpScreen} />
      <Stack.Screen name={OobeStackComponents.oobeFinishScreen} component={OobeFinishScreen} />
    </Stack.Navigator>
  );
};

export const useOobeStack = () => useNavigation<NativeStackNavigationProp<OobeStackParamList>>();
