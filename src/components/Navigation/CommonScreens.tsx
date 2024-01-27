import {DisabledView} from '../Views/Static/DisabledView';
import {UserProfileScreen} from '../Screens/User/UserProfileScreen';
import React from 'react';
import {SwiftarrFeature} from '../../libraries/Enums/AppFeatures';
import {useFeature} from '../Context/Contexts/FeatureContext';
import {MainStack} from './Stacks/MainStackNavigator';
import {ProfilePublicData} from '../../libraries/Structs/ControllerStructs';
import {EditUserProfileScreen} from '../Screens/User/EditUserProfileScreen';
import {UserPrivateNoteScreen} from '../Screens/User/UserPrivateNoteScreen';
import {UserRegCodeScreen} from '../Screens/User/UserRegCodeScreen';
import {UsernameProfileScreen} from '../Screens/User/UsernameProfileScreen';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {TwitarrView} from '../Views/TwitarrView';
import {MapScreen} from '../Screens/Main/MapScreen';
import {AccountRecoveryScreen} from '../Screens/Settings/Account/AccountRecoveryScreen';
import {LighterScreen} from '../Screens/Main/LighterScreen';

/**
 * The "Common Screens" pattern was adopted from
 * https://github.com/bluesky-social/social-app/blob/8a40916cd4b0c3e32d3515dd41c55e55695ef2e2/src/Navigation.tsx#L96
 *
 * Common Screens get defined here, with an input Stack to create them on. They are then rendered
 * in every navigator that needs them (usually the content-related ones like Forums and Seamail rather
 * than internal ones such as Root or Settings.
 *
 * The whole point of this is to get around the fact that React Navigation popToTop()'s the current stack
 * when you hit the back button and `initial: false` is set (which was needed to prevent stuck navigators).
 * This led to undesirable behavior where tapping a users avatar in a seamail brought you to their profile,
 * but then back would take you to the Today screen. Back again would get you back to the seamail but this
 * is still sub optimal. By defining a User Profile Screen for the current stack we can ensure that back
 * goes back to where we expect it do since we're not hopping between stacks/tabs.
 */

export type CommonStackParamList = {
  UserProfileScreen: {
    userID: string;
  };
  EditUserProfileScreen: {
    user: ProfilePublicData;
  };
  UserPrivateNoteScreen: {
    user: ProfilePublicData;
  };
  UserRegCodeScreen: {
    userID: string;
  };
  UsernameProfileScreen: {
    username: string;
  };
  SiteUIScreen: {
    resource?: string;
    id?: string;
    timestamp?: string;
    moderate?: boolean;
  };
  MapScreen: {
    deckNumber?: number;
  };
  AccountRecoveryScreen: undefined;
  LighterScreen: undefined;
};

export enum CommonStackComponents {
  userProfileScreen = 'UserProfileScreen',
  editUserProfileScreen = 'EditUserProfileScreen',
  userPrivateNoteScreen = 'UserPrivateNoteScreen',
  userRegCodeScreen = 'UserRegCodeScreen',
  usernameProfileScreen = 'UsernameProfileScreen',
  siteUIScreen = 'SiteUIScreen',
  mapScreen = 'MapScreen',
  accountRecoveryScreen = 'AccountRecoveryScreen',
  lighterScreen = 'LighterScreen',
}

export const CommonScreens = (Stack: typeof MainStack) => {
  const {getIsDisabled} = useFeature();
  const isUsersDisabled = getIsDisabled(SwiftarrFeature.users);

  return (
    <>
      <Stack.Screen
        name={CommonStackComponents.userProfileScreen}
        component={isUsersDisabled ? DisabledView : UserProfileScreen}
        options={{title: 'User Profile'}}
      />
      <Stack.Screen
        name={CommonStackComponents.usernameProfileScreen}
        component={isUsersDisabled ? DisabledView : UsernameProfileScreen}
        options={{title: 'User Profile'}}
      />
      <Stack.Screen
        name={CommonStackComponents.editUserProfileScreen}
        component={EditUserProfileScreen}
        options={{title: 'Edit Profile'}}
      />
      <Stack.Screen
        name={CommonStackComponents.userPrivateNoteScreen}
        component={UserPrivateNoteScreen}
        options={{title: 'Private Note'}}
      />
      <Stack.Screen
        name={CommonStackComponents.userRegCodeScreen}
        component={UserRegCodeScreen}
        options={{title: 'Registration'}}
      />
      <Stack.Screen
        name={CommonStackComponents.siteUIScreen}
        component={TwitarrView}
        options={{title: 'Twitarr Web UI'}}
      />
      <Stack.Screen name={CommonStackComponents.mapScreen} component={MapScreen} options={{title: 'Deck Map'}} />
      <Stack.Screen
        name={CommonStackComponents.accountRecoveryScreen}
        component={AccountRecoveryScreen}
        options={{title: 'Recovery'}}
      />
      <Stack.Screen name={CommonStackComponents.lighterScreen} component={LighterScreen} />
    </>
  );
};

export const useCommonStack = () => useNavigation<NativeStackNavigationProp<CommonStackParamList>>();
