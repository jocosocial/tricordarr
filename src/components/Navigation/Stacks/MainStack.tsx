import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackComponents} from '../../../libraries/Enums/Navigation';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {MainScreen} from '../../Screens/Main/MainScreen';
import {TwitarrView} from '../../Views/TwitarrView';
import {SettingsStack, SettingsStackParamList} from './SettingsStack';
import {AboutScreen} from '../../Screens/Main/AboutScreen';
import {UserProfileScreen} from '../../Screens/User/UserProfileScreen';
import {UserDirectoryScreen} from '../../Screens/User/UserDirectoryScreen';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {EditUserProfileScreen} from '../../Screens/User/EditUserProfileScreen';
import {UserPrivateNoteScreen} from '../../Screens/User/UserPrivateNoteScreen';
import {UserRegCodeScreen} from '../../Screens/User/UserRegCodeScreen';

export type MainStackParamList = {
  MainScreen: undefined;
  SiteUIScreen: {
    resource?: string;
    id?: string;
    timestamp?: string;
    moderate?: boolean;
  };
  MainSettingsScreen: NavigatorScreenParams<SettingsStackParamList>;
  AboutScreen: undefined;
  UserProfileScreen: {
    userID: string;
  };
  UserDirectoryScreen: undefined;
  EditUserProfileScreen: {
    user: ProfilePublicData;
  };
  UserPrivateNoteScreen: {
    user: ProfilePublicData;
  };
  UserRegCodeScreen: {
    userID: string;
  };
};

export const MainStack = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<MainStackParamList>();

  return (
    <Stack.Navigator initialRouteName={MainStackComponents.mainScreen} screenOptions={screenOptions}>
      <Stack.Screen name={MainStackComponents.mainScreen} component={MainScreen} options={{title: 'Twitarr Home'}} />
      <Stack.Screen
        name={MainStackComponents.siteUIScreen}
        component={TwitarrView}
        options={{title: 'Twitarr Web UI'}}
      />
      <Stack.Screen
        name={MainStackComponents.mainSettingsScreen}
        component={SettingsStack}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={MainStackComponents.aboutScreen}
        component={AboutScreen}
        options={{title: 'About Tricordarr'}}
      />
      <Stack.Screen
        name={MainStackComponents.userDirectoryScreen}
        component={UserDirectoryScreen}
        options={{title: 'Directory'}}
      />
      <Stack.Screen
        name={MainStackComponents.userProfileScreen}
        component={UserProfileScreen}
        options={{title: 'User Profile'}}
      />
      <Stack.Screen
        name={MainStackComponents.editUserProfileScreen}
        component={EditUserProfileScreen}
        options={{title: 'Edit Profile'}}
      />
      <Stack.Screen
        name={MainStackComponents.userPrivateNoteScreen}
        component={UserPrivateNoteScreen}
        options={{title: 'Private Note'}}
      />
      <Stack.Screen
        name={MainStackComponents.userRegCodeScreen}
        component={UserRegCodeScreen}
        options={{title: 'Registration'}}
      />
    </Stack.Navigator>
  );
};

export const useMainStack = () => useNavigation<NativeStackNavigationProp<MainStackParamList>>();
