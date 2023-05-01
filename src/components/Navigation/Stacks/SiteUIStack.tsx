import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SiteUIStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useNavigation} from '@react-navigation/native';
import {TwitarrView} from '../../Views/TwitarrView';
import {useStyles} from '../../Context/Contexts/StyleContext';

export type SiteUIStackParamList = {
  SiteUIScreen: undefined;
};

export const SiteUIStackStack = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<SiteUIStackParamList>();

  return (
    <Stack.Navigator initialRouteName={SiteUIStackScreenComponents.siteUIScreen} screenOptions={screenOptions}>
      <Stack.Screen
        name={SiteUIStackScreenComponents.siteUIScreen}
        component={TwitarrView}
        options={{title: 'Twitarr Web UI'}}
      />
    </Stack.Navigator>
  );
};

export const useSiteUIStack = () => useNavigation<NativeStackNavigationProp<SiteUIStackParamList>>();
