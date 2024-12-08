import {DisabledView} from '../Views/Static/DisabledView';
import {UserProfileScreen} from '../Screens/User/UserProfileScreen';
import React from 'react';
import {SwiftarrFeature} from '../../libraries/Enums/AppFeatures';
import {useFeature} from '../Context/Contexts/FeatureContext';
import {MainStack} from './Stacks/MainStackNavigator';
import {
  CategoryData,
  FezData,
  ForumData,
  ForumListData,
  PersonalEventData,
  PostData,
  ProfilePublicData,
  UserHeader,
} from '../../libraries/Structs/ControllerStructs';
import {EditUserProfileScreen} from '../Screens/User/EditUserProfileScreen';
import {UserPrivateNoteScreen} from '../Screens/User/UserPrivateNoteScreen';
import {UserRegCodeScreen} from '../Screens/User/UserRegCodeScreen';
import {UsernameProfileScreen} from '../Screens/User/UsernameProfileScreen';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SiteUIScreen} from '../Screens/SiteUI/SiteUIScreen.tsx';
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
import {AccessibilitySettingsScreen} from '../Screens/Settings/AccessibilitySettingsScreen.tsx';
import {ImageSettingsScreen} from '../Screens/Settings/Content/ImageSettingsScreen.tsx';
import {PersonalEventScreen} from '../Screens/PersonalEvent/PersonalEventScreen.tsx';
import {PersonalEventEditScreen} from '../Screens/PersonalEvent/PersonalEventEditScreen.tsx';
import {PersonalEventCreateScreen} from '../Screens/PersonalEvent/PersonalEventCreateScreen.tsx';
import {UserProfileHelpScreen} from '../Screens/User/UserProfileHelpScreen.tsx';
import {BlockUsersScreen} from '../Screens/User/BlockUsersScreen.tsx';
import {MuteUsersScreen} from '../Screens/User/MuteUsersScreen.tsx';
import {FavoriteUsersScreen} from '../Screens/User/FavoriteUsersScreen.tsx';
import {UserDirectoryHelpScreen} from '../Screens/User/UserDirectoryHelpScreen.tsx';
import {ForumSettingsScreen} from '../Screens/Settings/Content/ForumSettingsScreen.tsx';
import {ForumHelpScreen} from '../Screens/Forum/ForumHelpScreen.tsx';
import {ScheduleHelpScreen} from '../Screens/Schedule/ScheduleHelpScreen.tsx';
import {LfgParticipationHelpScreen} from '../Screens/LFG/LfgParticipationHelpScreen.tsx';
import {ForumPostSearchScreen} from '../Screens/Forum/Post/ForumPostSearchScreen.tsx';
import {SeamailHelpScreen} from '../Screens/Seamail/SeamailHelpScreen.tsx';
import {SiteUILinkScreen} from '../Screens/SiteUI/SiteUILinkScreen.tsx';
import {PerformerScreen} from '../Screens/Performer/PerformerScreen.tsx';
import {PerformerHelpScreen} from '../Screens/Performer/PerformerHelpScreen.tsx';

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
    enableContent?: boolean;
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
    admin?: boolean;
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
  PersonalEventScreen: {
    eventID: string;
  };
  ForumThreadScreen: {
    forumID: string;
    forumListData?: ForumListData;
  };
  AlertKeywordsSettingsScreen: undefined;
  MuteKeywordsSettingsScreen: undefined;
  ForumThreadPostScreen: {
    postID: string;
  };
  ForumPostEditScreen: {
    postData: PostData;
    forumData?: ForumData;
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
  AccessibilitySettingsScreen: undefined;
  ImageSettingsScreen: undefined;
  PersonalEventEditScreen: {
    personalEvent: PersonalEventData;
  };
  PersonalEventCreateScreen: {
    cruiseDay?: number;
  };
  UserProfileHelpScreen: undefined;
  BlockUsersScreen: undefined;
  MuteUsersScreen: undefined;
  FavoriteUsersScreen: undefined;
  UserDirectoryHelpScreen: undefined;
  ForumSettingsScreen: undefined;
  ForumHelpScreen: undefined;
  ScheduleHelpScreen: undefined;
  LfgParticipationHelpScreen: undefined;
  ForumPostSearchScreen: {
    category?: CategoryData;
    forum?: ForumListData | ForumData;
  };
  SeamailHelpScreen: undefined;
  SiteUILinkScreen: undefined;
  PerformerScreen: {
    id: string;
  };
  PerformerHelpScreen: undefined;
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
  accessibilitySettingsScreen = 'AccessibilitySettingsScreen',
  imageSettingsScreen = 'ImageSettingsScreen',
  personalEventScreen = 'PersonalEventScreen',
  personalEventEditScreen = 'PersonalEventEditScreen',
  personalEventCreateScreen = 'PersonalEventCreateScreen',
  userProfileHelpScreen = 'UserProfileHelpScreen',
  blockUsers = 'BlockUsersScreen',
  muteUsers = 'MuteUsersScreen',
  favoriteUsers = 'FavoriteUsersScreen',
  userDirectoryHelpScreen = 'UserDirectoryHelpScreen',
  forumSettingsScreen = 'ForumSettingsScreen',
  forumHelpScreen = 'ForumHelpScreen',
  scheduleHelpScreen = 'ScheduleHelpScreen',
  lfgParticipationHelpScreen = 'LfgParticipationHelpScreen',
  forumPostSearchScreen = 'ForumPostSearchScreen',
  seamailHelpScreen = 'SeamailHelpScreen',
  siteUILinkScreen = 'SiteUILinkScreen',
  performerScreen = 'PerformerScreen',
  performerHelpScreen = 'PerformerHelpScreen',
}

export const CommonScreens = (Stack: typeof MainStack) => {
  const {getIsDisabled} = useFeature();
  const isUsersDisabled = getIsDisabled(SwiftarrFeature.users);
  const isForumsDisabled = getIsDisabled(SwiftarrFeature.forums);
  const isSeamailDisabled = getIsDisabled(SwiftarrFeature.seamail);
  const isLfgDisabled = getIsDisabled(SwiftarrFeature.friendlyfez);
  const isPerformersDisabled = getIsDisabled(SwiftarrFeature.performers);

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
      <Stack.Screen
        name={CommonStackComponents.accessibilitySettingsScreen}
        component={AccessibilitySettingsScreen}
        options={{title: 'Accessibility'}}
      />
      <Stack.Screen
        name={CommonStackComponents.imageSettingsScreen}
        component={ImageSettingsScreen}
        options={{title: 'Image Settings'}}
      />
      <Stack.Screen
        name={CommonStackComponents.personalEventScreen}
        component={PersonalEventScreen}
        options={{title: 'Personal Event'}}
      />
      <Stack.Screen
        name={CommonStackComponents.personalEventEditScreen}
        component={PersonalEventEditScreen}
        options={{title: 'Edit Personal Event'}}
      />
      <Stack.Screen
        name={CommonStackComponents.personalEventCreateScreen}
        component={PersonalEventCreateScreen}
        options={{title: 'Create Personal Event'}}
      />
      <Stack.Screen
        name={CommonStackComponents.userProfileHelpScreen}
        component={UserProfileHelpScreen}
        options={{title: 'Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.blockUsers}
        component={BlockUsersScreen}
        options={{title: 'Blocked Users'}}
      />
      <Stack.Screen
        name={CommonStackComponents.muteUsers}
        component={MuteUsersScreen}
        options={{title: 'Muted Users'}}
      />
      <Stack.Screen
        name={CommonStackComponents.favoriteUsers}
        component={FavoriteUsersScreen}
        options={{title: 'Favorite Users'}}
      />
      <Stack.Screen
        name={CommonStackComponents.userDirectoryHelpScreen}
        component={UserDirectoryHelpScreen}
        options={{title: 'Directory Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumSettingsScreen}
        component={ForumSettingsScreen}
        options={{title: 'Forum Settings'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumHelpScreen}
        component={ForumHelpScreen}
        options={{title: 'Forum Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.scheduleHelpScreen}
        component={ScheduleHelpScreen}
        options={{title: 'Schedule Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgParticipationHelpScreen}
        component={LfgParticipationHelpScreen}
        options={{title: 'LFG Participation Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumPostSearchScreen}
        component={isForumsDisabled ? DisabledView : ForumPostSearchScreen}
        options={{title: 'Post Search'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailHelpScreen}
        component={SeamailHelpScreen}
        options={{title: 'Seamail Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.siteUILinkScreen}
        component={SiteUILinkScreen}
        options={{title: 'Twitarr'}}
      />
      <Stack.Screen
        name={CommonStackComponents.performerScreen}
        component={isPerformersDisabled ? DisabledView : PerformerScreen}
        options={{title: 'Performer'}}
      />
      <Stack.Screen
        name={CommonStackComponents.performerHelpScreen}
        component={PerformerHelpScreen}
        options={{title: 'Help'}}
      />
    </>
  );
};

export const useCommonStack = () => useNavigation<NativeStackNavigationProp<CommonStackParamList>>();

export const useCommonRoute = () => useRoute<RouteProp<CommonStackParamList>>();
