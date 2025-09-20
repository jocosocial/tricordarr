import {DisabledView} from '../Views/Static/DisabledView.tsx';
import {UserProfileScreen} from '../Screens/User/UserProfileScreen.tsx';
import React from 'react';
import {SwiftarrFeature} from '../../Libraries/Enums/AppFeatures.ts';
import {useFeature} from '../Context/Contexts/FeatureContext.ts';
import {MainStack} from './Stacks/MainStackNavigator.tsx';
import {
  CategoryData,
  FezData,
  ForumData,
  ForumListData,
  PerformerData,
  PostData,
  ProfilePublicData,
  UserHeader,
} from '../../Libraries/Structs/ControllerStructs.tsx';
import {UserProfileEditScreen} from '../Screens/User/UserProfileEditScreen.tsx';
import {UserPrivateNoteScreen} from '../Screens/User/UserPrivateNoteScreen.tsx';
import {UserRegCodeScreen} from '../Screens/User/UserRegCodeScreen.tsx';
import {UsernameProfileScreen} from '../Screens/User/UsernameProfileScreen.tsx';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SiteUIScreen} from '../Screens/SiteUI/SiteUIScreen.tsx';
import {MapScreen} from '../Screens/Main/MapScreen.tsx';
import {AccountRecoveryScreen} from '../Screens/Settings/Account/AccountRecoveryScreen.tsx';
import {ForumPostUserScreen} from '../Screens/Forum/Post/ForumPostUserScreen.tsx';
import {ForumThreadUserScreen} from '../Screens/Forum/Thread/ForumThreadUserScreen.tsx';
import {EventScreen} from '../Screens/Event/EventScreen.tsx';
import {ForumThreadScreen} from '../Screens/Forum/Thread/ForumThreadScreen.tsx';
import {AlertKeywordsSettingsScreen} from '../Screens/Settings/Content/AlertKeywordsSettingsScreen.tsx';
import {MuteKeywordsSettingsScreen} from '../Screens/Settings/Content/MuteKeywordsSettingsScreen.tsx';
import {ForumThreadPostScreen} from '../Screens/Forum/Thread/ForumThreadPostScreen.tsx';
import {ForumPostEditScreen} from '../Screens/Forum/Post/ForumPostEditScreen.tsx';
import {SeamailCreateScreen} from '../Screens/Seamail/SeamailCreateScreen.tsx';
import {ForumPostPinnedScreen} from '../Screens/Forum/Post/ForumPostPinnedScreen.tsx';
import {ConfigServerUrlScreen} from '../Screens/Settings/Config/ConfigServerUrlScreen.tsx';
import {ForumPostHashtagScreen} from '../Screens/Forum/Post/ForumPostHashtagScreen.tsx';
import {SeamailAddParticipantScreen} from '../Screens/Seamail/SeamailAddParticipantScreen.tsx';
import {FezChatDetailsScreen} from '../Screens/Fez/FezChatDetailsScreen.tsx';
import {LfgScreen} from '../Screens/LFG/LfgScreen.tsx';
import {LfgParticipationScreen} from '../Screens/LFG/LfgParticipationScreen.tsx';
import {LfgAddParticipantScreen} from '../Screens/LFG/LfgAddParticipantScreen.tsx';
import {LfgEditScreen} from '../Screens/LFG/LfgEditScreen.tsx';
import {ForumThreadEditScreen} from '../Screens/Forum/Thread/ForumThreadEditScreen.tsx';
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
import {ForumPostSearchScreen} from '../Screens/Forum/Post/ForumPostSearchScreen.tsx';
import {SeamailHelpScreen} from '../Screens/Seamail/SeamailHelpScreen.tsx';
import {SiteUILinkScreen} from '../Screens/SiteUI/SiteUILinkScreen.tsx';
import {PerformerScreen} from '../Screens/Performer/PerformerScreen.tsx';
import {PerformerHelpScreen} from '../Screens/Performer/PerformerHelpScreen.tsx';
import {SiteUIHelpScreen} from '../Screens/SiteUI/SiteUIHelpScreen.tsx';
import {LfgHelpScreen} from '../Screens/LFG/LfgHelpScreen.tsx';
import {MainTimeZoneScreen} from '../Screens/Main/MainTimeZoneScreen.tsx';
import {TimeZoneHelpScreen} from '../Screens/Main/TimeZoneHelpScreen.tsx';
import {FezChatScreen} from '../Screens/Fez/FezChatScreen.tsx';
import {FezType} from '../../Libraries/Enums/FezType.ts';
import {ScheduleImportScreen} from '../Screens/Schedule/ScheduleImportScreen.tsx';
import {EventSearchScreen} from '../Screens/Event/EventSearchScreen.tsx';
import {EventAddPerformerScreen} from '../Screens/Event/EventAddPerformerScreen.tsx';
import {PerformerCreateScreen} from '../Screens/Performer/PerformerCreateScreen.tsx';
import {PerformerType} from '../Queries/Performer/PerformerQueries.ts';
import {PerformerEditScreen} from '../Screens/Performer/PerformerEditScreen.tsx';
import {EventSettingsScreen} from '../Screens/Event/EventSettingsScreen.tsx';
import {ScheduleDayScreen} from '../Screens/Schedule/ScheduleDayScreen.tsx';
import {SchedulePrivateEventsScreen} from '../Screens/Schedule/SchedulePrivateEventsScreen.tsx';
import {useDrawer} from '../Context/Contexts/DrawerContext.ts';
import {ParamsWithOobe} from '../../Libraries/Types/index.ts';

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
    oobe?: boolean;
  };
  EditUserProfileScreen: {
    user: ProfilePublicData;
    oobe?: boolean;
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
  SeamailChatScreen: {
    fezID: string;
  };
  FezChatDetailsScreen: {
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
    personalEvent: FezData;
  };
  PersonalEventCreateScreen: {
    cruiseDay?: number;
  };
  UserProfileHelpScreen: ParamsWithOobe;
  BlockUsersScreen: undefined;
  MuteUsersScreen: undefined;
  FavoriteUsersScreen: undefined;
  UserDirectoryHelpScreen: undefined;
  ForumSettingsScreen: undefined;
  ForumHelpScreen: undefined;
  ScheduleHelpScreen: undefined;
  ForumPostSearchScreen: {
    category?: CategoryData;
    forum?: ForumListData | ForumData;
  };
  SeamailHelpScreen: undefined;
  SiteUILinkScreen: undefined;
  PerformerScreen: {
    id: string;
    eventID?: string;
  };
  PerformerHelpScreen: undefined;
  SiteUIHelpScreen: ParamsWithOobe;
  LfgHelpScreen: undefined;
  MainTimeZoneScreen: undefined;
  TimeZoneHelpScreen: undefined;
  PrivateEventChatScreen: {
    fezID: string;
  };
  ScheduleImportScreen: undefined;
  EventSearchScreen: undefined;
  EventAddPerformerScreen: {
    eventID: string;
  };
  PerformerCreateScreen: {
    performerType: PerformerType;
    eventID: string;
  };
  PerformerEditScreen: {
    performerData: PerformerData;
    eventID: string;
  };
  EventSettingsScreen: undefined;
  SchedulePrivateEventsScreen: undefined;
  ScheduleDayScreen: ParamsWithOobe;
};

export enum CommonStackComponents {
  userProfileScreen = 'UserProfileScreen',
  userProfileEditScreen = 'EditUserProfileScreen',
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
  seamailChatScreen = 'SeamailChatScreen',
  fezChatDetailsScreen = 'FezChatDetailsScreen',
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
  forumPostSearchScreen = 'ForumPostSearchScreen',
  seamailHelpScreen = 'SeamailHelpScreen',
  siteUILinkScreen = 'SiteUILinkScreen',
  performerScreen = 'PerformerScreen',
  performerHelpScreen = 'PerformerHelpScreen',
  siteUIHelpScreen = 'SiteUIHelpScreen',
  lfgHelpScreen = 'LfgHelpScreen',
  mainTimeZoneScreen = 'MainTimeZoneScreen',
  timeZoneHelpScreen = 'TimeZoneHelpScreen',
  privateEventChatScreen = 'PrivateEventChatScreen',
  scheduleImportScreen = 'ScheduleImportScreen',
  eventSearchScreen = 'EventSearchScreen',
  eventAddPerformerScreen = 'EventAddPerformerScreen',
  performerCreateScreen = 'PerformerCreateScreen',
  performerEditScreen = 'PerformerEditScreen',
  eventSettingsScreen = 'EventSettingsScreen',
  schedulePrivateEventsScreen = 'SchedulePrivateEventsScreen',
  scheduleDayScreen = 'ScheduleDayScreen',
}

export const CommonScreens = (Stack: typeof MainStack) => {
  const {getIsDisabled} = useFeature();
  const isUsersDisabled = getIsDisabled(SwiftarrFeature.users);
  const isForumsDisabled = getIsDisabled(SwiftarrFeature.forums);
  const isSeamailDisabled = getIsDisabled(SwiftarrFeature.seamail);
  const isLfgDisabled = getIsDisabled(SwiftarrFeature.friendlyfez);
  const isPerformersDisabled = getIsDisabled(SwiftarrFeature.performers);
  const isPersonalEventDisabled = getIsDisabled(SwiftarrFeature.personalevents);
  const isScheduleDisabled = getIsDisabled(SwiftarrFeature.schedule);
  const {getLeftMainHeaderButtons} = useDrawer();

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
        name={CommonStackComponents.userProfileEditScreen}
        component={isUsersDisabled ? DisabledView : UserProfileEditScreen}
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
        name={CommonStackComponents.seamailChatScreen}
        component={isSeamailDisabled ? DisabledView : FezChatScreen}
        // The simple headerTitle string below gets overwritten in the SeamailScreen component.
        // This is here as a performance optimization.
        // The reason it renders in the component is that deep linking doesnt pass in the title
        // so it has to figure it out.
        options={{title: FezType.getChatTitle(FezType.open)}}
      />
      <Stack.Screen
        name={CommonStackComponents.fezChatDetailsScreen}
        component={isSeamailDisabled ? DisabledView : FezChatDetailsScreen}
        options={() => ({title: 'Chat Details'})}
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
        component={isLfgDisabled ? DisabledView : FezChatScreen}
        options={{title: FezType.getChatTitle(FezType.activity)}}
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
      <Stack.Screen
        name={CommonStackComponents.siteUIHelpScreen}
        component={SiteUIHelpScreen}
        options={{title: 'Webview Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgHelpScreen}
        component={LfgHelpScreen}
        options={{title: 'Looking For Group (LFG) Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.mainTimeZoneScreen}
        component={MainTimeZoneScreen}
        options={{title: 'Time Zones'}}
      />
      <Stack.Screen
        name={CommonStackComponents.timeZoneHelpScreen}
        component={TimeZoneHelpScreen}
        options={{title: 'Time Zone Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.privateEventChatScreen}
        component={isPersonalEventDisabled ? DisabledView : FezChatScreen}
        options={{title: FezType.getChatTitle(FezType.privateEvent)}}
      />
      <Stack.Screen
        name={CommonStackComponents.scheduleImportScreen}
        component={ScheduleImportScreen}
        options={{title: 'Schedule Import'}}
      />
      <Stack.Screen
        name={CommonStackComponents.eventSearchScreen}
        component={EventSearchScreen}
        options={{title: 'Search Events'}}
      />
      <Stack.Screen
        name={CommonStackComponents.eventAddPerformerScreen}
        component={EventAddPerformerScreen}
        options={{title: 'Add Performer'}}
      />
      <Stack.Screen
        name={CommonStackComponents.performerCreateScreen}
        component={PerformerCreateScreen}
        options={{title: 'Create Performer'}}
      />
      <Stack.Screen
        name={CommonStackComponents.performerEditScreen}
        component={PerformerEditScreen}
        options={{title: 'Edit Performer'}}
      />
      <Stack.Screen
        name={CommonStackComponents.eventSettingsScreen}
        component={EventSettingsScreen}
        options={{title: 'Schedule Settings'}}
      />
      <Stack.Screen
        name={CommonStackComponents.scheduleDayScreen}
        component={isScheduleDisabled ? DisabledView : ScheduleDayScreen}
        options={{
          headerLeft: getLeftMainHeaderButtons,
          title: 'Schedule',
        }}
      />
      <Stack.Screen
        name={CommonStackComponents.schedulePrivateEventsScreen}
        component={isScheduleDisabled ? DisabledView : SchedulePrivateEventsScreen}
        options={{title: 'Personal Events'}}
      />
    </>
  );
};

export const useCommonStack = () => useNavigation<NativeStackNavigationProp<CommonStackParamList>>();

export const useCommonRoute = () => useRoute<RouteProp<CommonStackParamList>>();
