import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';

import {FezType} from '#src/Enums/FezType';
import {PerformerType} from '#src/Queries/Performer/PerformerQueries';
import {BoardgameHelpScreen} from '#src/Screens/Boardgames/BoardgameHelpScreen';
import {DisabledHelpScreen} from '#src/Screens/Disabled/DisabledHelpScreen';
import {PreRegistrationHelpScreen} from '#src/Screens/Disabled/PreRegistrationHelpScreen';
import {EventAddPerformerScreen} from '#src/Screens/Event/EventAddPerformerScreen';
import {EventScreen} from '#src/Screens/Event/EventScreen';
import {EventSearchScreen} from '#src/Screens/Event/EventSearchScreen';
import {EventSettingsScreen} from '#src/Screens/Event/EventSettingsScreen';
import {FezChatDetailsHelpScreen} from '#src/Screens/Fez/FezChatDetailsHelpScreen';
import {FezChatDetailsScreen} from '#src/Screens/Fez/FezChatDetailsScreen';
import {FezChatHelpScreen} from '#src/Screens/Fez/FezChatHelpScreen';
import {FezChatScreen} from '#src/Screens/Fez/FezChatScreen';
import {ForumCategoriesHelpScreen} from '#src/Screens/Forum/ForumCategoriesHelpScreen';
import {ForumCategoryHelpScreen} from '#src/Screens/Forum/ForumCategoryHelpScreen';
import {ForumHelpScreen} from '#src/Screens/Forum/ForumHelpScreen';
import {ForumPostSearchHelpScreen} from '#src/Screens/Forum/ForumPostSearchHelpScreen';
import {ForumThreadCreateHelpScreen} from '#src/Screens/Forum/ForumThreadCreateHelpScreen';
import {ForumThreadHelpScreen} from '#src/Screens/Forum/ForumThreadHelpScreen';
import {ForumThreadSearchHelpScreen} from '#src/Screens/Forum/ForumThreadSearchHelpScreen';
import {KeywordsHelpScreen} from '#src/Screens/Forum/KeywordsHelpScreen';
import {ForumPostEditScreen} from '#src/Screens/Forum/Post/ForumPostEditScreen';
import {ForumPostHashtagScreen} from '#src/Screens/Forum/Post/ForumPostHashtagScreen';
import {ForumPostPinnedScreen} from '#src/Screens/Forum/Post/ForumPostPinnedScreen';
import {ForumPostSearchScreen} from '#src/Screens/Forum/Post/ForumPostSearchScreen';
import {ForumPostUserScreen} from '#src/Screens/Forum/Post/ForumPostUserScreen';
import {ForumThreadEditScreen} from '#src/Screens/Forum/Thread/ForumThreadEditScreen';
import {ForumThreadPostScreen} from '#src/Screens/Forum/Thread/ForumThreadPostScreen';
import {ForumThreadScreen} from '#src/Screens/Forum/Thread/ForumThreadScreen';
import {ForumThreadUserScreen} from '#src/Screens/Forum/Thread/ForumThreadUserScreen';
import {HelpManualScreen} from '#src/Screens/Help/HelpManualScreen';
import {ModeratorHelpScreen} from '#src/Screens/Help/ModeratorHelpScreen';
import {ShutternautHelpScreen} from '#src/Screens/Help/ShutternautHelpScreen';
import {KaraokeHelpScreen} from '#src/Screens/Karaoke/KaraokeHelpScreen';
import {LfgAddParticipantScreen} from '#src/Screens/LFG/LfgAddParticipantScreen';
import {LfgCreateHelpScreen} from '#src/Screens/LFG/LfgCreateHelpScreen';
import {LfgEditScreen} from '#src/Screens/LFG/LfgEditScreen';
import {LfgHelpScreen} from '#src/Screens/LFG/LfgHelpScreen';
import {LfgListHelpScreen} from '#src/Screens/LFG/LfgListHelpScreen';
import {LfgParticipationHelpScreen} from '#src/Screens/LFG/LfgParticipationHelpScreen';
import {LfgParticipationScreen} from '#src/Screens/LFG/LfgParticipationScreen';
import {LfgScreen} from '#src/Screens/LFG/LfgScreen';
import {LfgSettingsScreen} from '#src/Screens/LFG/LfgSettingsScreen';
import {AboutTricordarrScreen} from '#src/Screens/Main/AboutTricordarrScreen';
import {AboutTwitarrScreen} from '#src/Screens/Main/AboutTwitarrScreen';
import {CruiseHelpScreen} from '#src/Screens/Main/CruiseHelpScreen';
import {DailyThemeHelpScreen} from '#src/Screens/Main/DailyThemeHelpScreen';
import {EasterEggHelpScreen} from '#src/Screens/Main/EasterEggHelpScreen';
import {EasterEggScreen} from '#src/Screens/Main/EasterEggScreen';
import {MainHelpScreen} from '#src/Screens/Main/MainHelpScreen';
import {MainTimeZoneScreen} from '#src/Screens/Main/MainTimeZoneScreen';
import {MapHelpScreen} from '#src/Screens/Main/MapHelpScreen';
import {MapScreen} from '#src/Screens/Main/MapScreen';
import {PrivacyScreen} from '#src/Screens/Main/PrivacyScreen';
import {TimeZoneHelpScreen} from '#src/Screens/Main/TimeZoneHelpScreen';
import {TodayHelpScreen} from '#src/Screens/Main/TodayHelpScreen';
import {MicroKaraokeHelpScreen} from '#src/Screens/MicroKaraoke/MicroKaraokeHelpScreen';
import {PerformerCreateScreen} from '#src/Screens/Performer/PerformerCreateScreen';
import {PerformerEditScreen} from '#src/Screens/Performer/PerformerEditScreen';
import {PerformerHelpScreen} from '#src/Screens/Performer/PerformerHelpScreen';
import {PerformerScreen} from '#src/Screens/Performer/PerformerScreen';
import {PersonalEventCreateScreen} from '#src/Screens/PersonalEvent/PersonalEventCreateScreen';
import {PersonalEventEditScreen} from '#src/Screens/PersonalEvent/PersonalEventEditScreen';
import {PersonalEventScreen} from '#src/Screens/PersonalEvent/PersonalEventScreen';
import {PhotostreamEventScreen} from '#src/Screens/Photostream/PhotostreamEventScreen';
import {PhotostreamHelpScreen} from '#src/Screens/Photostream/PhotostreamHelpScreen';
import {EventHelpScreen} from '#src/Screens/Schedule/EventHelpScreen';
import {PersonalEventHelpScreen} from '#src/Screens/Schedule/PersonalEventHelpScreen';
import {ScheduleDayHelpScreen} from '#src/Screens/Schedule/ScheduleDayHelpScreen';
import {ScheduleDayPlannerHelpScreen} from '#src/Screens/Schedule/ScheduleDayPlannerHelpScreen';
import {ScheduleDayPlannerScreen} from '#src/Screens/Schedule/ScheduleDayPlannerScreen';
import {ScheduleDayScreen} from '#src/Screens/Schedule/ScheduleDayScreen';
import {ScheduleHelpScreen} from '#src/Screens/Schedule/ScheduleHelpScreen';
import {ScheduleImportScreen} from '#src/Screens/Schedule/ScheduleImportScreen';
import {ScheduleOverlapHelpScreen} from '#src/Screens/Schedule/ScheduleOverlapHelpScreen';
import {ScheduleOverlapScreen} from '#src/Screens/Schedule/ScheduleOverlapScreen';
import {SeamailAddParticipantScreen} from '#src/Screens/Seamail/SeamailAddParticipantScreen';
import {SeamailCreateHelpScreen} from '#src/Screens/Seamail/SeamailCreateHelpScreen';
import {SeamailCreateScreen} from '#src/Screens/Seamail/SeamailCreateScreen';
import {SeamailEditScreen} from '#src/Screens/Seamail/SeamailEditScreen';
import {SeamailHelpScreen} from '#src/Screens/Seamail/SeamailHelpScreen';
import {SeamailListHelpScreen} from '#src/Screens/Seamail/SeamailListHelpScreen';
import {SeamailSearchHelpScreen} from '#src/Screens/Seamail/SeamailSearchHelpScreen';
import {SeamailSettingsScreen} from '#src/Screens/Seamail/SeamailSettingsScreen';
import {AccessibilitySettingsScreen} from '#src/Screens/Settings/AccessibilitySettingsScreen';
import {AccountRecoveryScreen} from '#src/Screens/Settings/Account/AccountRecoveryScreen';
import {ConfigServerUrlScreen} from '#src/Screens/Settings/Config/ConfigServerUrlScreen';
import {AlertKeywordsScreen} from '#src/Screens/Settings/Content/AlertKeywordsSettingsScreen';
import {ForumSettingsScreen} from '#src/Screens/Settings/Content/ForumSettingsScreen';
import {ImageSettingsScreen} from '#src/Screens/Settings/Content/ImageSettingsScreen';
import {MuteKeywordsScreen} from '#src/Screens/Settings/Content/MuteKeywordsSettingsScreen';
import {SiteUIHelpScreen} from '#src/Screens/SiteUI/SiteUIHelpScreen';
import {SiteUILinkScreen} from '#src/Screens/SiteUI/SiteUILinkScreen';
import {SiteUIScreen} from '#src/Screens/SiteUI/SiteUIScreen';
import {BlockUsersScreen} from '#src/Screens/User/BlockUsersScreen';
import {FavoriteUsersScreen} from '#src/Screens/User/FavoriteUsersScreen';
import {MuteUsersScreen} from '#src/Screens/User/MuteUsersScreen';
import {UserDirectoryHelpScreen} from '#src/Screens/User/UserDirectoryHelpScreen';
import {UsernameProfileScreen} from '#src/Screens/User/UsernameProfileScreen';
import {UserPrivateNoteScreen} from '#src/Screens/User/UserPrivateNoteScreen';
import {UserProfileEditScreen} from '#src/Screens/User/UserProfileEditScreen';
import {UserProfileHelpScreen} from '#src/Screens/User/UserProfileHelpScreen';
import {UserProfileScreen} from '#src/Screens/User/UserProfileScreen';
import {UserRegCodeScreen} from '#src/Screens/User/UserRegCodeScreen';
import {UserSelfProfileScreen} from '#src/Screens/User/UserSelfProfileScreen';
import {
  CategoryData,
  EventData,
  FezData,
  ForumData,
  ForumListData,
  PerformerData,
  PostData,
  ProfilePublicData,
  UserHeader,
} from '#src/Structs/ControllerStructs';
import {NoDrawerParams, Optional, ScheduleDayParams, WithScrollToTopIntent} from '#src/Types/RouteParams';

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
  UserSelfProfileScreen: undefined;
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
    action?: string;
    timestamp?: string;
    moderate?: boolean;
    admin?: boolean;
  };
  MapScreen: {
    deckNumber?: number;
  };
  AccountRecoveryScreen: undefined;
  EasterEggScreen: undefined;
  ForumThreadUserScreen: {
    user: UserHeader;
  };
  ForumPostUserScreen: {
    user: UserHeader;
  };
  EventScreen: {
    eventID: string;
  };
  PhotostreamEventScreen: WithScrollToTopIntent<{
    eventID: string;
  }>;
  PersonalEventScreen: {
    eventID: string;
  };
  ForumThreadScreen: {
    forumID: string;
    forumListData?: ForumListData;
  };
  AlertKeywordsScreen: undefined;
  MuteKeywordsScreen: undefined;
  ForumThreadPostScreen: {
    postID: string;
  };
  ForumPostEditScreen: {
    postData: PostData;
    forumData?: ForumData;
  };
  SeamailCreateScreen?: {
    initialUserHeaders?: UserHeader[];
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
    initialReadCount?: number;
  };
  FezChatDetailsScreen: {
    fezID: string;
  };
  SeamailAddParticipantScreen: {
    fez: FezData;
  };
  SeamailEditScreen: {
    fezID: string;
  };
  LfgScreen: {
    fezID: string;
  };
  LfgParticipationScreen: {
    fezID: string;
  };
  LfgAddParticipantScreen: {
    fezID: string;
    fezType: FezType;
  };
  LfgChatScreen: {
    fezID: string;
    initialReadCount?: number;
  };
  LfgEditScreen: {
    fez: FezData;
  };
  LfgSettingsScreen: undefined;
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
    initialUserHeaders?: UserHeader[];
  };
  UserProfileHelpScreen: undefined;
  BlockUsersScreen: undefined;
  MuteUsersScreen: undefined;
  FavoriteUsersScreen: undefined;
  UserDirectoryHelpScreen: undefined;
  ForumSettingsScreen: undefined;
  ForumHelpScreen: undefined;
  ForumCategoriesHelpScreen: undefined;
  ForumCategoryHelpScreen: undefined;
  ForumThreadHelpScreen: undefined;
  ForumThreadCreateHelpScreen: undefined;
  ForumThreadSearchHelpScreen: undefined;
  ForumPostSearchHelpScreen: undefined;
  KeywordsHelpScreen: undefined;
  ScheduleHelpScreen: undefined;
  ScheduleDayHelpScreen: undefined;
  ScheduleDayPlannerHelpScreen: undefined;
  ScheduleOverlapHelpScreen: undefined;
  ForumPostSearchScreen: {
    category?: CategoryData;
    forum?: ForumListData | ForumData;
  };
  SeamailHelpScreen: undefined;
  SeamailListHelpScreen: undefined;
  SeamailSearchHelpScreen: undefined;
  SeamailCreateHelpScreen: undefined;
  SeamailSettingsScreen: undefined;
  FezChatHelpScreen: undefined;
  FezChatDetailsHelpScreen: undefined;
  SiteUILinkScreen: undefined;
  PerformerScreen: {
    id: string;
    eventID?: string;
  };
  PerformerHelpScreen: undefined;
  SiteUIHelpScreen: undefined;
  DisabledHelpScreen: undefined;
  LfgHelpScreen: undefined;
  LfgListHelpScreen: undefined;
  LfgCreateHelpScreen: undefined;
  LfgParticipationHelpScreen: undefined;
  EventHelpScreen: {
    mode?: 'official' | 'shadow';
  };
  PersonalEventHelpScreen: undefined;
  MainTimeZoneScreen: undefined;
  TimeZoneHelpScreen: undefined;
  PrivateEventChatScreen: {
    fezID: string;
    initialReadCount?: number;
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
  ScheduleDayScreen: ScheduleDayParams & Optional<NoDrawerParams>;
  ScheduleDayPlannerScreen: {
    cruiseDay?: number;
  };
  ScheduleOverlapScreen: {
    eventData: EventData | FezData;
  };
  PreRegistrationHelpScreen: undefined;
  HelpIndexScreen: undefined;
  MainHelpScreen: undefined;
  AboutTricordarrScreen: undefined;
  AboutTwitarrScreen: undefined;
  PrivacyScreen: undefined;
  ShutternautHelpScreen: undefined;
  ModeratorHelpScreen: undefined;
  BoardgameHelpScreen: undefined;
  PhotostreamHelpScreen: undefined;
  KaraokeHelpScreen: undefined;
  MicroKaraokeHelpScreen: undefined;
  MapHelpScreen: undefined;
  CruiseHelpScreen: undefined;
  DailyThemeHelpScreen: undefined;
  EasterEggHelpScreen: undefined;
  TodayHelpScreen: undefined;
};

export enum CommonStackComponents {
  userProfileScreen = 'UserProfileScreen',
  userSelfProfileScreen = 'UserSelfProfileScreen',
  userProfileEditScreen = 'EditUserProfileScreen',
  userPrivateNoteScreen = 'UserPrivateNoteScreen',
  userRegCodeScreen = 'UserRegCodeScreen',
  usernameProfileScreen = 'UsernameProfileScreen',
  siteUIScreen = 'SiteUIScreen',
  mapScreen = 'MapScreen',
  accountRecoveryScreen = 'AccountRecoveryScreen',
  easterEggScreen = 'EasterEggScreen',
  forumThreadUserScreen = 'ForumThreadUserScreen',
  forumPostUserScreen = 'ForumPostUserScreen',
  eventScreen = 'EventScreen',
  photostreamEventScreen = 'PhotostreamEventScreen',
  forumThreadScreen = 'ForumThreadScreen',
  alertKeywords = 'AlertKeywordsScreen',
  muteKeywords = 'MuteKeywordsScreen',
  forumThreadPostScreen = 'ForumThreadPostScreen',
  forumPostEditScreen = 'ForumPostEditScreen',
  seamailCreateScreen = 'SeamailCreateScreen',
  forumPostPinnedScreen = 'ForumPostPinnedScreen',
  configServerUrl = 'ConfigServerUrlScreen',
  forumPostHashtagScreen = 'ForumPostHashtagScreen',
  seamailChatScreen = 'SeamailChatScreen',
  fezChatDetailsScreen = 'FezChatDetailsScreen',
  seamailAddParticipantScreen = 'SeamailAddParticipantScreen',
  seamailEditScreen = 'SeamailEditScreen',
  lfgScreen = 'LfgScreen',
  lfgParticipationScreen = 'LfgParticipationScreen',
  lfgAddParticipantScreen = 'LfgAddParticipantScreen',
  lfgChatScreen = 'LfgChatScreen',
  lfgEditScreen = 'LfgEditScreen',
  lfgSettingsScreen = 'LfgSettingsScreen',
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
  forumCategoriesHelpScreen = 'ForumCategoriesHelpScreen',
  forumCategoryHelpScreen = 'ForumCategoryHelpScreen',
  forumThreadHelpScreen = 'ForumThreadHelpScreen',
  forumThreadCreateHelpScreen = 'ForumThreadCreateHelpScreen',
  forumThreadSearchHelpScreen = 'ForumThreadSearchHelpScreen',
  forumPostSearchHelpScreen = 'ForumPostSearchHelpScreen',
  keywordsHelpScreen = 'KeywordsHelpScreen',
  scheduleHelpScreen = 'ScheduleHelpScreen',
  scheduleDayHelpScreen = 'ScheduleDayHelpScreen',
  scheduleDayPlannerHelpScreen = 'ScheduleDayPlannerHelpScreen',
  scheduleOverlapHelpScreen = 'ScheduleOverlapHelpScreen',
  forumPostSearchScreen = 'ForumPostSearchScreen',
  seamailHelpScreen = 'SeamailHelpScreen',
  seamailListHelpScreen = 'SeamailListHelpScreen',
  seamailSearchHelpScreen = 'SeamailSearchHelpScreen',
  seamailCreateHelpScreen = 'SeamailCreateHelpScreen',
  seamailSettingsScreen = 'SeamailSettingsScreen',
  fezChatHelpScreen = 'FezChatHelpScreen',
  fezChatDetailsHelpScreen = 'FezChatDetailsHelpScreen',
  siteUILinkScreen = 'SiteUILinkScreen',
  performerScreen = 'PerformerScreen',
  performerHelpScreen = 'PerformerHelpScreen',
  siteUIHelpScreen = 'SiteUIHelpScreen',
  disabledHelpScreen = 'DisabledHelpScreen',
  lfgHelpScreen = 'LfgHelpScreen',
  lfgListHelpScreen = 'LfgListHelpScreen',
  lfgCreateHelpScreen = 'LfgCreateHelpScreen',
  lfgParticipationHelpScreen = 'LfgParticipationHelpScreen',
  eventHelpScreen = 'EventHelpScreen',
  personalEventHelpScreen = 'PersonalEventHelpScreen',
  mainTimeZoneScreen = 'MainTimeZoneScreen',
  timeZoneHelpScreen = 'TimeZoneHelpScreen',
  privateEventChatScreen = 'PrivateEventChatScreen',
  scheduleImportScreen = 'ScheduleImportScreen',
  eventSearchScreen = 'EventSearchScreen',
  eventAddPerformerScreen = 'EventAddPerformerScreen',
  performerCreateScreen = 'PerformerCreateScreen',
  performerEditScreen = 'PerformerEditScreen',
  eventSettingsScreen = 'EventSettingsScreen',
  scheduleDayScreen = 'ScheduleDayScreen',
  scheduleDayPlannerScreen = 'ScheduleDayPlannerScreen',
  scheduleOverlapScreen = 'ScheduleOverlapScreen',
  preRegistrationHelpScreen = 'PreRegistrationHelpScreen',
  helpIndexScreen = 'HelpIndexScreen',
  mainHelpScreen = 'MainHelpScreen',
  aboutTricordarrScreen = 'AboutTricordarrScreen',
  aboutTwitarrScreen = 'AboutTwitarrScreen',
  privacyScreen = 'PrivacyScreen',
  shutternautHelpScreen = 'ShutternautHelpScreen',
  moderatorHelpScreen = 'ModeratorHelpScreen',
  boardgameHelpScreen = 'BoardgameHelpScreen',
  photostreamHelpScreen = 'PhotostreamHelpScreen',
  karaokeHelpScreen = 'KaraokeHelpScreen',
  microKaraokeHelpScreen = 'MicroKaraokeHelpScreen',
  mapHelpScreen = 'MapHelpScreen',
  cruiseHelpScreen = 'CruiseHelpScreen',
  dailyThemeHelpScreen = 'DailyThemeHelpScreen',
  easterEggHelpScreen = 'EasterEggHelpScreen',
  todayHelpScreen = 'TodayHelpScreen',
}

/**
 * Helper type for help screens. Needed for proper typing when calling commonNavigation.push().
 */
export type HelpScreenComponents =
  | CommonStackComponents.preRegistrationHelpScreen
  | CommonStackComponents.moderatorHelpScreen
  | CommonStackComponents.scheduleHelpScreen
  | CommonStackComponents.scheduleDayHelpScreen
  | CommonStackComponents.scheduleDayPlannerHelpScreen
  | CommonStackComponents.scheduleOverlapHelpScreen
  | CommonStackComponents.userDirectoryHelpScreen
  | CommonStackComponents.forumHelpScreen
  | CommonStackComponents.forumCategoriesHelpScreen
  | CommonStackComponents.forumCategoryHelpScreen
  | CommonStackComponents.forumThreadHelpScreen
  | CommonStackComponents.forumThreadCreateHelpScreen
  | CommonStackComponents.forumThreadSearchHelpScreen
  | CommonStackComponents.forumPostSearchHelpScreen
  | CommonStackComponents.keywordsHelpScreen
  | CommonStackComponents.seamailHelpScreen
  | CommonStackComponents.seamailListHelpScreen
  | CommonStackComponents.seamailSearchHelpScreen
  | CommonStackComponents.seamailCreateHelpScreen
  | CommonStackComponents.fezChatHelpScreen
  | CommonStackComponents.fezChatDetailsHelpScreen
  | CommonStackComponents.performerHelpScreen
  | CommonStackComponents.siteUIHelpScreen
  | CommonStackComponents.disabledHelpScreen
  | CommonStackComponents.lfgHelpScreen
  | CommonStackComponents.lfgListHelpScreen
  | CommonStackComponents.lfgCreateHelpScreen
  | CommonStackComponents.lfgParticipationHelpScreen
  | CommonStackComponents.eventHelpScreen
  | CommonStackComponents.personalEventHelpScreen
  | CommonStackComponents.timeZoneHelpScreen
  | CommonStackComponents.helpIndexScreen
  | CommonStackComponents.mainHelpScreen
  | CommonStackComponents.aboutTricordarrScreen
  | CommonStackComponents.aboutTwitarrScreen
  | CommonStackComponents.shutternautHelpScreen
  | CommonStackComponents.boardgameHelpScreen
  | CommonStackComponents.photostreamHelpScreen
  | CommonStackComponents.karaokeHelpScreen
  | CommonStackComponents.microKaraokeHelpScreen
  | CommonStackComponents.userProfileHelpScreen
  | CommonStackComponents.mapHelpScreen
  | CommonStackComponents.cruiseHelpScreen
  | CommonStackComponents.dailyThemeHelpScreen
  | CommonStackComponents.easterEggHelpScreen
  | CommonStackComponents.todayHelpScreen;

export const CommonScreens = (Stack: {Screen: React.ComponentType<any>}) => {
  return (
    <>
      <Stack.Screen
        name={CommonStackComponents.userProfileScreen}
        component={UserProfileScreen}
        options={{title: 'User Profile'}}
      />
      <Stack.Screen
        name={CommonStackComponents.usernameProfileScreen}
        component={UsernameProfileScreen}
        options={{title: 'User Profile'}}
      />
      <Stack.Screen
        name={CommonStackComponents.userProfileEditScreen}
        component={UserProfileEditScreen}
        options={{title: 'Edit Profile'}}
      />
      <Stack.Screen
        name={CommonStackComponents.userSelfProfileScreen}
        component={UserSelfProfileScreen}
        options={{title: 'Your Profile'}}
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
        name={CommonStackComponents.easterEggScreen}
        component={EasterEggScreen}
        options={{title: 'Easter Egg'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumPostUserScreen}
        component={ForumPostUserScreen}
        options={{title: 'Posts by User'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumThreadUserScreen}
        component={ForumThreadUserScreen}
        options={{title: 'Forums by User'}}
      />
      <Stack.Screen name={CommonStackComponents.eventScreen} component={EventScreen} options={{title: 'Event'}} />
      <Stack.Screen
        name={CommonStackComponents.photostreamEventScreen}
        component={PhotostreamEventScreen}
        options={{title: 'Event Photos'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumThreadScreen}
        component={ForumThreadScreen}
        options={{
          title: 'Forum',
        }}
      />
      <Stack.Screen
        name={CommonStackComponents.alertKeywords}
        component={AlertKeywordsScreen}
        options={{title: 'Alert Keywords'}}
      />
      <Stack.Screen
        name={CommonStackComponents.muteKeywords}
        component={MuteKeywordsScreen}
        options={{title: 'Mute Keywords'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumThreadPostScreen}
        component={ForumThreadPostScreen}
        options={{
          title: 'Forum',
        }}
      />
      <Stack.Screen
        name={CommonStackComponents.forumPostEditScreen}
        component={ForumPostEditScreen}
        options={{title: 'Edit Post'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailCreateScreen}
        component={SeamailCreateScreen}
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
        component={ForumPostHashtagScreen}
        options={{title: 'Hashtag'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailChatScreen}
        component={FezChatScreen}
        // The simple headerTitle string below gets overwritten in the SeamailScreen component.
        // This is here as a performance optimization.
        // The reason it renders in the component is that deep linking doesnt pass in the title
        // so it has to figure it out.
        options={{title: FezType.getChatTitle(FezType.open)}}
      />
      <Stack.Screen
        name={CommonStackComponents.fezChatDetailsScreen}
        component={FezChatDetailsScreen}
        options={() => ({title: 'Chat Details'})}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailAddParticipantScreen}
        component={SeamailAddParticipantScreen}
        options={{title: 'Add Participant'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailEditScreen}
        component={SeamailEditScreen}
        options={{title: 'Edit Seamail'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgScreen}
        component={LfgScreen}
        options={{title: 'Looking For Group'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgParticipationScreen}
        component={LfgParticipationScreen}
        options={{title: 'Participation'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgAddParticipantScreen}
        component={LfgAddParticipantScreen}
        options={{title: 'Add Participant'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgChatScreen}
        component={FezChatScreen}
        options={{title: FezType.getChatTitle(FezType.activity)}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgEditScreen}
        component={LfgEditScreen}
        options={{title: 'Edit LFG'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgSettingsScreen}
        component={LfgSettingsScreen}
        options={{title: 'LFG Settings'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumThreadEditScreen}
        component={ForumThreadEditScreen}
        options={{title: 'Edit Forum'}}
      />
      <Stack.Screen
        name={CommonStackComponents.accessibilitySettingsScreen}
        component={AccessibilitySettingsScreen}
        options={{title: 'Appearance'}}
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
        options={{title: 'Profile Help'}}
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
        name={CommonStackComponents.forumCategoriesHelpScreen}
        component={ForumCategoriesHelpScreen}
        options={{title: 'Categories Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumCategoryHelpScreen}
        component={ForumCategoryHelpScreen}
        options={{title: 'Category Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumThreadHelpScreen}
        component={ForumThreadHelpScreen}
        options={{title: 'Thread Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumThreadCreateHelpScreen}
        component={ForumThreadCreateHelpScreen}
        options={{title: 'Create Thread Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumThreadSearchHelpScreen}
        component={ForumThreadSearchHelpScreen}
        options={{title: 'Thread Search Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumPostSearchHelpScreen}
        component={ForumPostSearchHelpScreen}
        options={{title: 'Post Search Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.keywordsHelpScreen}
        component={KeywordsHelpScreen}
        options={{title: 'Keywords Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.scheduleHelpScreen}
        component={ScheduleHelpScreen}
        options={{title: 'Schedule Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.scheduleDayHelpScreen}
        component={ScheduleDayHelpScreen}
        options={{title: 'Schedule Day Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.scheduleDayPlannerHelpScreen}
        component={ScheduleDayPlannerHelpScreen}
        options={{title: 'Day Planner Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.scheduleOverlapHelpScreen}
        component={ScheduleOverlapHelpScreen}
        options={{title: 'Overlapping Events Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumPostSearchScreen}
        component={ForumPostSearchScreen}
        options={{title: 'Post Search'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailHelpScreen}
        component={SeamailHelpScreen}
        options={{title: 'Seamail Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailListHelpScreen}
        component={SeamailListHelpScreen}
        options={{title: 'Seamail List Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailSearchHelpScreen}
        component={SeamailSearchHelpScreen}
        options={{title: 'Seamail Search Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailCreateHelpScreen}
        component={SeamailCreateHelpScreen}
        options={{title: 'Seamail Create Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailSettingsScreen}
        component={SeamailSettingsScreen}
        options={{title: 'Seamail Settings'}}
      />
      <Stack.Screen
        name={CommonStackComponents.fezChatHelpScreen}
        component={FezChatHelpScreen}
        options={{title: 'Chat Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.fezChatDetailsHelpScreen}
        component={FezChatDetailsHelpScreen}
        options={{title: 'Chat Details Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.siteUILinkScreen}
        component={SiteUILinkScreen}
        options={{title: 'Twitarr'}}
      />
      <Stack.Screen
        name={CommonStackComponents.performerScreen}
        component={PerformerScreen}
        options={{title: 'Performer'}}
      />
      <Stack.Screen
        name={CommonStackComponents.performerHelpScreen}
        component={PerformerHelpScreen}
        options={{title: 'Performer Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.siteUIHelpScreen}
        component={SiteUIHelpScreen}
        options={{title: 'Webview Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.disabledHelpScreen}
        component={DisabledHelpScreen}
        options={{title: 'Disabled Feature Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgHelpScreen}
        component={LfgHelpScreen}
        options={{title: 'Looking For Group Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgListHelpScreen}
        component={LfgListHelpScreen}
        options={{title: 'LFG List Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgCreateHelpScreen}
        component={LfgCreateHelpScreen}
        options={{title: 'New LFG Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.lfgParticipationHelpScreen}
        component={LfgParticipationHelpScreen}
        options={{title: 'LFG Participation Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.eventHelpScreen}
        component={EventHelpScreen}
        options={({route}: {route: RouteProp<CommonStackParamList, 'EventHelpScreen'>}) => ({
          title: route.params?.mode === 'shadow' ? 'Shadow Event Help' : 'Official Event Help',
        })}
      />
      <Stack.Screen
        name={CommonStackComponents.personalEventHelpScreen}
        component={PersonalEventHelpScreen}
        options={{title: 'Personal Event Help'}}
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
        component={FezChatScreen}
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
        component={ScheduleDayScreen}
        options={{title: 'Schedule'}}
      />
      <Stack.Screen
        name={CommonStackComponents.scheduleDayPlannerScreen}
        component={ScheduleDayPlannerScreen}
        options={{title: 'Day Planner'}}
      />
      <Stack.Screen
        name={CommonStackComponents.scheduleOverlapScreen}
        component={ScheduleOverlapScreen}
        options={{title: 'Overlapping Events'}}
      />
      <Stack.Screen
        name={CommonStackComponents.preRegistrationHelpScreen}
        component={PreRegistrationHelpScreen}
        options={{title: 'Pre-Registration Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.helpIndexScreen}
        component={HelpManualScreen}
        options={{title: 'Help Manual'}}
      />
      <Stack.Screen
        name={CommonStackComponents.mainHelpScreen}
        component={MainHelpScreen}
        options={{title: 'General Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.aboutTricordarrScreen}
        component={AboutTricordarrScreen}
        options={{title: 'About Tricordarr'}}
      />
      <Stack.Screen
        name={CommonStackComponents.aboutTwitarrScreen}
        component={AboutTwitarrScreen}
        options={{title: 'About Twitarr'}}
      />
      <Stack.Screen
        name={CommonStackComponents.privacyScreen}
        component={PrivacyScreen}
        options={{title: 'Privacy Policy'}}
      />
      <Stack.Screen
        name={CommonStackComponents.shutternautHelpScreen}
        component={ShutternautHelpScreen}
        options={{title: 'Shutternaut Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.moderatorHelpScreen}
        component={ModeratorHelpScreen}
        options={{title: 'Moderator Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.boardgameHelpScreen}
        component={BoardgameHelpScreen}
        options={{title: 'Board Game Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.photostreamHelpScreen}
        component={PhotostreamHelpScreen}
        options={{title: 'Photostream Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.karaokeHelpScreen}
        component={KaraokeHelpScreen}
        options={{title: 'Karaoke Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.microKaraokeHelpScreen}
        component={MicroKaraokeHelpScreen}
        options={{title: 'Microkaraoke Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.mapHelpScreen}
        component={MapHelpScreen}
        options={{title: 'Map Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.cruiseHelpScreen}
        component={CruiseHelpScreen}
        options={{title: 'Cruise Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.dailyThemeHelpScreen}
        component={DailyThemeHelpScreen}
        options={{title: 'Daily Theme Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.todayHelpScreen}
        component={TodayHelpScreen}
        options={{title: 'Today Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.easterEggHelpScreen}
        component={EasterEggHelpScreen}
        options={{title: '...... why?'}}
      />
    </>
  );
};

export const useCommonStack = () => useNavigation<StackNavigationProp<CommonStackParamList>>();

export const useCommonRoute = () => useRoute<RouteProp<CommonStackParamList>>();
