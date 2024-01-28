import {DisabledView} from '../Views/Static/DisabledView';
import {UserProfileScreen} from '../Screens/User/UserProfileScreen';
import React from 'react';
import {SwiftarrFeature} from '../../libraries/Enums/AppFeatures';
import {useFeature} from '../Context/Contexts/FeatureContext';
import {MainStack} from './Stacks/MainStackNavigator';
import {FezData, ForumData, PostData, ProfilePublicData, UserHeader} from '../../libraries/Structs/ControllerStructs';
import {EditUserProfileScreen} from '../Screens/User/EditUserProfileScreen';
import {UserPrivateNoteScreen} from '../Screens/User/UserPrivateNoteScreen';
import {UserRegCodeScreen} from '../Screens/User/UserRegCodeScreen';
import {UsernameProfileScreen} from '../Screens/User/UsernameProfileScreen';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SiteUIScreen} from '../Screens/SiteUIScreen';
import {MapScreen} from '../Screens/Main/MapScreen';
import {AccountRecoveryScreen} from '../Screens/Settings/Account/AccountRecoveryScreen';
import {ForumPostUserScreen} from '../Screens/Forum/Post/ForumPostUserScreen';
import {ForumThreadUserScreen} from '../Screens/Forum/Thread/ForumThreadUserScreen';
import {EventScreen} from '../Screens/Event/EventScreen';
import {ForumThreadScreen} from '../Screens/Forum/Thread/ForumThreadScreen';
import {AlertKeywordsSettingsScreen} from '../Screens/Settings/Content/AlertKeywordsSettingsScreen';
import {MuteKeywordsSettingsScreen} from '../Screens/Settings/Content/MuteKeywordsSettingsScreen';
import {ForumThreadPostScreen} from '../Screens/Forum/Thread/ForumThreadPostScreen';
import {ForumPostEditScreen} from '../Screens/Forum/Post/ForumPostEditScreen';
import {SeamailCreateScreen} from '../Screens/Seamail/SeamailCreateScreen';
import {ForumPostPinnedScreen} from '../Screens/Forum/Post/ForumPostPinnedScreen';
import {ConfigServerUrlScreen} from '../Screens/Settings/Config/ConfigServerUrlScreen';
import {ForumPostHashtagScreen} from '../Screens/Forum/Post/ForumPostHashtagScreen';
import {SeamailAddParticipantScreen} from '../Screens/Seamail/SeamailAddParticipantScreen';
import {SeamailScreen} from '../Screens/Seamail/SeamailScreen';
import {SeamailDetailsScreen} from '../Screens/Seamail/SeamailDetailsScreen';
import {LfgScreen} from '../Screens/LFG/LfgScreen';
import {LfgParticipationScreen} from '../Screens/LFG/LfgParticipationScreen';
import {LfgAddParticipantScreen} from '../Screens/LFG/LfgAddParticipantScreen';
import {LfgChatScreen} from '../Screens/LFG/LfgChatScreen';
import {LfgEditScreen} from '../Screens/LFG/LfgEditScreen';
import {ForumThreadEditScreen} from '../Screens/Forum/Thread/ForumThreadEditScreen';

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
  ForumThreadUserScreen: {
    user: UserHeader;
  };
  ForumPostUserScreen: {
    user: UserHeader;
  };
  EventScreen: {
    eventID: string;
  };
  ForumThreadScreen: {
    forumID: string;
  };
  AlertKeywordsSettingsScreen: undefined;
  MuteKeywordsSettingsScreen: undefined;
  ForumThreadPostScreen: {
    postID: string;
  };
  ForumPostEditScreen: {
    postData: PostData;
  };
  SeamailCreateScreen?: {
    initialUserHeader?: UserHeader;
    initialAsModerator?: boolean;
    initialAsTwitarrTeam?: boolean;
  };
  ForumPostPinnedScreen: {
    forumID: string;
  };
  ConfigServerUrlScreen: undefined;
  ForumPostHashtagScreen: {
    hashtag: string;
  };
  SeamailScreen: {
    fezID: string;
    title: string;
  };
  SeamailDetailsScreen: {
    fezID: string;
  };
  SeamailAddParticipantScreen: {
    fez: FezData;
  };
  LfgScreen: {
    fezID: string;
  };
  LfgParticipationScreen: {
    fezID: string;
  };
  LfgAddParticipantScreen: {
    fezID: string;
  };
  LfgChatScreen: {
    fezID: string;
  };
  LfgEditScreen: {
    fez: FezData;
  };
  ForumThreadEditScreen: {
    forumData: ForumData;
  };
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
  forumThreadUserScreen = 'ForumThreadUserScreen',
  forumPostUserScreen = 'ForumPostUserScreen',
  eventScreen = 'EventScreen',
  forumThreadScreen = 'ForumThreadScreen',
  alertKeywords = 'AlertKeywordsSettingsScreen',
  muteKeywords = 'MuteKeywordsSettingsScreen',
  forumThreadPostScreen = 'ForumThreadPostScreen',
  forumPostEditScreen = 'ForumPostEditScreen',
  seamailCreateScreen = 'SeamailCreateScreen',
  forumPostPinnedScreen = 'ForumPostPinnedScreen',
  configServerUrl = 'ConfigServerUrlScreen',
  forumPostHashtagScreen = 'ForumPostHashtagScreen',
  seamailScreen = 'SeamailScreen',
  seamailDetailsScreen = 'SeamailDetailsScreen',
  seamailAddParticipantScreen = 'SeamailAddParticipantScreen',
  lfgScreen = 'LfgScreen',
  lfgParticipationScreen = 'LfgParticipationScreen',
  lfgAddParticipantScreen = 'LfgAddParticipantScreen',
  lfgChatScreen = 'LfgChatScreen',
  lfgEditScreen = 'LfgEditScreen',
  forumThreadEditScreen = 'ForumThreadEditScreen',
}

export const CommonScreens = (Stack: typeof MainStack) => {
  const {getIsDisabled} = useFeature();
  const isUsersDisabled = getIsDisabled(SwiftarrFeature.users);
  const isForumsDisabled = getIsDisabled(SwiftarrFeature.forums);
  const isSeamailDisabled = getIsDisabled(SwiftarrFeature.seamail);
  const isLfgDisabled = getIsDisabled(SwiftarrFeature.friendlyfez);

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
        component={isUsersDisabled ? DisabledView : EditUserProfileScreen}
        options={{title: 'Edit Profile'}}
      />
      <Stack.Screen
        name={CommonStackComponents.userPrivateNoteScreen}
        component={isUsersDisabled ? DisabledView : UserPrivateNoteScreen}
        options={{title: 'Private Note'}}
      />
      <Stack.Screen
        name={CommonStackComponents.userRegCodeScreen}
        component={isUsersDisabled ? DisabledView : UserRegCodeScreen}
        options={{title: 'Registration'}}
      />
      <Stack.Screen
        name={CommonStackComponents.siteUIScreen}
        component={SiteUIScreen}
        options={{title: 'Twitarr Web UI'}}
      />
      <Stack.Screen name={CommonStackComponents.mapScreen} component={MapScreen} options={{title: 'Deck Map'}} />
      <Stack.Screen
        name={CommonStackComponents.accountRecoveryScreen}
        component={AccountRecoveryScreen}
        options={{title: 'Recovery'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumPostUserScreen}
        component={isForumsDisabled ? DisabledView : ForumPostUserScreen}
        options={{title: 'Posts by User'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumThreadUserScreen}
        component={isForumsDisabled ? DisabledView : ForumThreadUserScreen}
        options={{title: 'Forums by User'}}
      />
      <Stack.Screen name={CommonStackComponents.eventScreen} component={EventScreen} options={{title: 'Event'}} />
      <Stack.Screen
        name={CommonStackComponents.forumThreadScreen}
        component={isForumsDisabled ? DisabledView : ForumThreadScreen}
        options={{
          title: 'Forum',
        }}
      />
      <Stack.Screen
        name={CommonStackComponents.alertKeywords}
        component={AlertKeywordsSettingsScreen}
        options={{title: 'Alert Keywords'}}
      />
      <Stack.Screen
        name={CommonStackComponents.muteKeywords}
        component={MuteKeywordsSettingsScreen}
        options={{title: 'Mute Keywords'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumThreadPostScreen}
        component={isForumsDisabled ? DisabledView : ForumThreadPostScreen}
        options={{
          title: 'Forum',
        }}
      />
      <Stack.Screen
        name={CommonStackComponents.forumPostEditScreen}
        component={isForumsDisabled ? DisabledView : ForumPostEditScreen}
        options={{title: 'Edit Post'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailCreateScreen}
        component={isSeamailDisabled ? DisabledView : SeamailCreateScreen}
        options={{title: 'New Seamail'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumPostPinnedScreen}
        component={ForumPostPinnedScreen}
        options={{title: 'Pinned Posts'}}
      />
      <Stack.Screen
        name={CommonStackComponents.configServerUrl}
        component={ConfigServerUrlScreen}
        options={{title: 'Server URL'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumPostHashtagScreen}
        component={isForumsDisabled ? DisabledView : ForumPostHashtagScreen}
        options={{title: 'Hashtag'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailScreen}
        component={isSeamailDisabled ? DisabledView : SeamailScreen}
        // The simple headerTitle string below gets overwritten in the SeamailScreen component.
        // This is here as a performance optimization.
        // The reason it renders in the component is that deep linking doesnt pass in the title
        // so it has to figure it out.
        options={{title: 'Seamail Chat'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailDetailsScreen}
        component={isSeamailDisabled ? DisabledView : SeamailDetailsScreen}
        options={() => ({title: 'Seamail Details'})}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailAddParticipantScreen}
        component={isSeamailDisabled ? DisabledView : SeamailAddParticipantScreen}
        options={{title: 'Add Participant'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgScreen}
        component={isLfgDisabled ? DisabledView : LfgScreen}
        options={{title: 'Looking For Group'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgParticipationScreen}
        component={isLfgDisabled ? DisabledView : LfgParticipationScreen}
        options={{title: 'Participation'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgAddParticipantScreen}
        component={isLfgDisabled ? DisabledView : LfgAddParticipantScreen}
        options={{title: 'Add Participant'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgChatScreen}
        component={isLfgDisabled ? DisabledView : LfgChatScreen}
        options={{title: 'LFG Chat'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgEditScreen}
        component={isLfgDisabled ? DisabledView : LfgEditScreen}
        options={{title: 'Edit'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumThreadEditScreen}
        component={isForumsDisabled ? DisabledView : ForumThreadEditScreen}
        options={{title: 'Edit Forum'}}
      />
    </>
  );
};

export const useCommonStack = () => useNavigation<NativeStackNavigationProp<CommonStackParamList>>();
