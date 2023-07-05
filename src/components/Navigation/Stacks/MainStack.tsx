import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackComponents} from '../../../libraries/Enums/Navigation';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {MainView} from '../../Views/Static/MainView';
import {TwitarrView} from '../../Views/TwitarrView';

export type MainStackParamList = {
  MainScreen: undefined;
  SiteUIScreen: undefined;
};

export const MainStack = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<MainStackParamList>();

  return (
    <Stack.Navigator initialRouteName={MainStackComponents.mainScreen} screenOptions={screenOptions}>
      <Stack.Screen name={MainStackComponents.mainScreen} component={MainView} options={{headerShown: false}} />
      <Stack.Screen
        name={MainStackComponents.siteUIScreen}
        component={TwitarrView}
        options={{title: 'Twitarr Web UI'}}
      />
    </Stack.Navigator>
  );
};

export const useMainStack = () => useNavigation<NativeStackNavigationProp<MainStackParamList>>();
