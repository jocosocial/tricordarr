import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SiteUIStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useNavigation} from '@react-navigation/native';
import {useAppTheme} from '../../../styles/Theme';
import {TwitarrView} from '../../Views/TwitarrView';

export type SiteUIStackParamList = {
  SiteUIScreen: undefined;
};

export const SiteUIStackStack = () => {
  const Stack = createNativeStackNavigator<SiteUIStackParamList>();
  const theme = useAppTheme();
  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTitleStyle: {
      color: theme.colors.onBackground,
    },
    headerTintColor: theme.colors.onBackground,
  };

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
