import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import type {FezType} from '#src/Enums/FezType';
import type {ReportContentType} from '#src/Enums/ReportContentType';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {PerformerType} from '#src/Queries/Performer/PerformerQueries';
import {type UserRelationMode} from '#src/Queries/Users/UserRelationConstants';
import {
  AnnouncementData,
  CategoryData,
  DailyThemeData,
  EventData,
  FezData,
  ForumData,
  ForumListData,
  PerformerData,
  PostData,
  ProfilePublicData,
  UserHeader,
} from '#src/Structs/ControllerStructs';
import {
  NoDrawerParams,
  Optional,
  ScheduleDayParams,
  WithElevation,
  WithInitialUserHeaders,
  WithScrollToTopIntent,
} from '#src/Types/RouteParams';

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
  RecoveryKeyScreen: {
    recoveryKey: string;
    username: string;
  };
  ReportScreen: {
    contentType: ReportContentType;
    contentID: string | number;
  };
  ReportHelpScreen: undefined;
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
  PhotostreamUserScreen: WithScrollToTopIntent<{
    user: UserHeader;
  }>;
  PersonalEventScreen: {
    eventID: string;
  };
  ForumThreadScreen: WithElevation<{
    forumID: string;
    forumListData?: ForumListData;
  }>;
  AlertKeywordsScreen: undefined;
  MuteKeywordsScreen: undefined;
  ForumThreadPostScreen: WithElevation<{
    postID: string;
  }>;
  ForumPostEditScreen: {
    postData: PostData;
    forumData?: ForumData;
  };
  SeamailListScreen: WithElevation<
    WithScrollToTopIntent<
      NoDrawerParams & {
        onlyNew?: boolean;
      }
    >
  >;
  SeamailSearchScreen: {
    forUser?: string;
  };
  SeamailCreateScreen?: WithElevation<WithInitialUserHeaders<{}>>;
  ForumPostMentionScreen: Optional<WithElevation>;
  ForumPostPinnedScreen: {
    forumID: string;
  };
  ConfigServerUrlScreen: undefined;
  ForumPostHashtagScreen: {
    hashtag: string;
  };
  SeamailChatScreen: WithElevation<{
    fezID: string;
    initialReadCount?: number;
  }>;
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
  ShareSettingsScreen: undefined;
  PersonalEventEditScreen: {
    personalEvent: FezData;
  };
  PersonalEventCreateScreen: WithInitialUserHeaders<{
    cruiseDay?: number;
  }>;
  LfgCreateScreen: WithInitialUserHeaders<{
    cruiseDay?: number;
    title?: string;
    info?: string;
    fezType?: FezType;
    maxCapacity?: number;
  }>;
  UserProfileHelpScreen: undefined;
  UserProfilesHelpScreen: undefined;
  UserProfileSelfHelpScreen: undefined;
  UsersListScreen: {
    mode?: UserRelationMode;
  };
  SearchUsersScreen: {
    mode: UserRelationMode;
  };
  UserDirectoryHelpScreen: undefined;
  ForumSettingsScreen: undefined;
  ForumHelpScreen: undefined;
  ForumCategoriesHelpScreen: undefined;
  ForumCategoryHelpScreen: undefined;
  ForumThreadHelpScreen: undefined;
  ForumThreadCreateHelpScreen: undefined;
  ForumThreadSearchHelpScreen: undefined;
  ForumPostSearchHelpScreen: undefined;
  ForumPostMentionHelpScreen: undefined;
  KeywordsHelpScreen: undefined;
  ScheduleHelpScreen: undefined;
  ScheduleDayHelpScreen: undefined;
  ScheduleDayPlannerHelpScreen: undefined;
  ScheduleImportHelpScreen: undefined;
  ScheduleOverlapHelpScreen: undefined;
  ForumPostSearchScreen: {
    category?: CategoryData;
    forum?: ForumListData | ForumData;
  };
  SeamailHelpScreen: undefined;
  SeamailListHelpScreen: undefined;
  SeamailSearchHelpScreen: undefined;
  SeamailCreateHelpScreen: undefined;
  ChatSettingsScreen: undefined;
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
  EventHelpScreen:
    | {
        mode?: 'official' | 'shadow';
      }
    | undefined;
  PersonalEventHelpScreen: undefined;
  MainTimeZoneScreen: undefined;
  TimeZoneHelpScreen: undefined;
  PrivateEventChatScreen: {
    fezID: string;
    initialReadCount?: number;
  };
  ScheduleImportScreen: undefined;
  CruiseSettingsScreen: undefined;
  EventSearchScreen: undefined;
  EventLocationScreen: {
    location: string;
    cruiseDay?: number;
  };
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
  KrakenTalkCreateScreen?: {
    initialUserHeader?: UserHeader;
  };
  KrakenTalkActiveCallScreen?: {
    callID: string;
  };
  KrakenTalkHelpScreen: undefined;
  AdminScreen: undefined;
  AdminHelpScreen: undefined;
  AnnouncementHelpScreen: undefined;
  RegistrationCodeHelpScreen: undefined;
  AdminAnnouncementsScreen: undefined;
  AdminAnnouncementEditScreen: {
    announcement?: AnnouncementData;
  };
  AdminDailyThemesScreen: undefined;
  AdminDailyThemeEditScreen: {
    dailyTheme?: DailyThemeData;
  };
  AdminServerSettingsScreen: undefined;
  AdminServerSettingsHelpScreen: undefined;
  AdminFeaturesScreen: undefined;
  AdminRollupScreen: undefined;
  AdminTimeZonesScreen: undefined;
  AdminScheduleScreen: undefined;
  AdminScheduleVerifyScreen: undefined;
  AdminScheduleLogScreen: {
    logID: number;
  };
  AdminRegCodesScreen: undefined;
  AdminRegCodeStatsScreen: undefined;
  AdminDiscordRegCodeScreen: undefined;
  AdminUserRolesScreen: {
    role?: UserRoleType;
  };
  AdminAccessLevelsScreen: {
    level?: 'moderator' | 'twitarrteam' | 'tho';
  };
  AdminBulkUserScreen: undefined;
  AdminKaraokeScreen: undefined;
  AdminBoardgamesScreen: undefined;
  AdminHuntsScreen: undefined;
  AdminHuntEditScreen: {
    huntID?: string;
  };
  AdminPuzzleEditScreen: {
    huntID: string;
    puzzleID: string;
  };
  HuntScreen: {
    huntID: string;
  };
  HuntPuzzleScreen: {
    puzzleID: string;
  };
  HuntHelpScreen: undefined;
  EventFeedbackSelectScreen: {
    room?: string;
  };
  EventFeedbackFormScreen: {
    eventUID: string;
  };
  AdminEventFeedbackScreen: undefined;
  AdminEventFeedbackReportsScreen: {
    location?: string;
    userID?: string;
  };
  AdminEventFeedbackStatsScreen: undefined;
  AdminEventFeedbackReportScreen: {
    feedbackID: string;
  };
  EventFeedbackHelpScreen:
    | {
        mode?: 'admin';
      }
    | undefined;
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
  recoveryKeyScreen = 'RecoveryKeyScreen',
  reportScreen = 'ReportScreen',
  reportHelpScreen = 'ReportHelpScreen',
  easterEggScreen = 'EasterEggScreen',
  forumThreadUserScreen = 'ForumThreadUserScreen',
  forumPostUserScreen = 'ForumPostUserScreen',
  eventScreen = 'EventScreen',
  photostreamEventScreen = 'PhotostreamEventScreen',
  photostreamUserScreen = 'PhotostreamUserScreen',
  forumThreadScreen = 'ForumThreadScreen',
  alertKeywords = 'AlertKeywordsScreen',
  muteKeywords = 'MuteKeywordsScreen',
  forumThreadPostScreen = 'ForumThreadPostScreen',
  forumPostEditScreen = 'ForumPostEditScreen',
  seamailListScreen = 'SeamailListScreen',
  seamailSearchScreen = 'SeamailSearchScreen',
  seamailCreateScreen = 'SeamailCreateScreen',
  forumPostMentionScreen = 'ForumPostMentionScreen',
  forumPostPinnedScreen = 'ForumPostPinnedScreen',
  configServerUrl = 'ConfigServerUrlScreen',
  forumPostHashtagScreen = 'ForumPostHashtagScreen',
  seamailChatScreen = 'SeamailChatScreen',
  fezChatDetailsScreen = 'FezChatDetailsScreen',
  seamailAddParticipantScreen = 'SeamailAddParticipantScreen',
  seamailEditScreen = 'SeamailEditScreen',
  lfgCreateScreen = 'LfgCreateScreen',
  lfgScreen = 'LfgScreen',
  lfgParticipationScreen = 'LfgParticipationScreen',
  lfgAddParticipantScreen = 'LfgAddParticipantScreen',
  lfgChatScreen = 'LfgChatScreen',
  lfgEditScreen = 'LfgEditScreen',
  lfgSettingsScreen = 'LfgSettingsScreen',
  forumThreadEditScreen = 'ForumThreadEditScreen',
  accessibilitySettingsScreen = 'AccessibilitySettingsScreen',
  imageSettingsScreen = 'ImageSettingsScreen',
  shareSettingsScreen = 'ShareSettingsScreen',
  personalEventScreen = 'PersonalEventScreen',
  personalEventEditScreen = 'PersonalEventEditScreen',
  personalEventCreateScreen = 'PersonalEventCreateScreen',
  userProfileHelpScreen = 'UserProfileHelpScreen',
  userProfilesHelpScreen = 'UserProfilesHelpScreen',
  userProfileSelfHelpScreen = 'UserProfileSelfHelpScreen',
  usersList = 'UsersListScreen',
  searchUsers = 'SearchUsersScreen',
  userDirectoryHelpScreen = 'UserDirectoryHelpScreen',
  forumSettingsScreen = 'ForumSettingsScreen',
  forumHelpScreen = 'ForumHelpScreen',
  forumCategoriesHelpScreen = 'ForumCategoriesHelpScreen',
  forumCategoryHelpScreen = 'ForumCategoryHelpScreen',
  forumThreadHelpScreen = 'ForumThreadHelpScreen',
  forumThreadCreateHelpScreen = 'ForumThreadCreateHelpScreen',
  forumThreadSearchHelpScreen = 'ForumThreadSearchHelpScreen',
  forumPostSearchHelpScreen = 'ForumPostSearchHelpScreen',
  forumPostMentionHelpScreen = 'ForumPostMentionHelpScreen',
  keywordsHelpScreen = 'KeywordsHelpScreen',
  scheduleHelpScreen = 'ScheduleHelpScreen',
  scheduleDayHelpScreen = 'ScheduleDayHelpScreen',
  scheduleDayPlannerHelpScreen = 'ScheduleDayPlannerHelpScreen',
  scheduleImportHelpScreen = 'ScheduleImportHelpScreen',
  scheduleOverlapHelpScreen = 'ScheduleOverlapHelpScreen',
  forumPostSearchScreen = 'ForumPostSearchScreen',
  seamailHelpScreen = 'SeamailHelpScreen',
  seamailListHelpScreen = 'SeamailListHelpScreen',
  seamailSearchHelpScreen = 'SeamailSearchHelpScreen',
  seamailCreateHelpScreen = 'SeamailCreateHelpScreen',
  chatSettingsScreen = 'ChatSettingsScreen',
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
  cruiseSettingsScreen = 'CruiseSettingsScreen',
  eventSearchScreen = 'EventSearchScreen',
  eventLocationScreen = 'EventLocationScreen',
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
  krakenTalkCreateScreen = 'KrakenTalkCreateScreen',
  krakenTalkActiveCallScreen = 'KrakenTalkActiveCallScreen',
  krakenTalkHelpScreen = 'KrakenTalkHelpScreen',
  adminScreen = 'AdminScreen',
  adminHelpScreen = 'AdminHelpScreen',
  announcementHelpScreen = 'AnnouncementHelpScreen',
  registrationCodeHelpScreen = 'RegistrationCodeHelpScreen',
  adminServerSettingsHelpScreen = 'AdminServerSettingsHelpScreen',
  adminAnnouncementsScreen = 'AdminAnnouncementsScreen',
  adminAnnouncementEditScreen = 'AdminAnnouncementEditScreen',
  adminDailyThemesScreen = 'AdminDailyThemesScreen',
  adminDailyThemeEditScreen = 'AdminDailyThemeEditScreen',
  adminServerSettingsScreen = 'AdminServerSettingsScreen',
  adminFeaturesScreen = 'AdminFeaturesScreen',
  adminRollupScreen = 'AdminRollupScreen',
  adminTimeZonesScreen = 'AdminTimeZonesScreen',
  adminScheduleScreen = 'AdminScheduleScreen',
  adminScheduleVerifyScreen = 'AdminScheduleVerifyScreen',
  adminScheduleLogScreen = 'AdminScheduleLogScreen',
  adminRegCodesScreen = 'AdminRegCodesScreen',
  adminRegCodeStatsScreen = 'AdminRegCodeStatsScreen',
  adminDiscordRegCodeScreen = 'AdminDiscordRegCodeScreen',
  adminUserRolesScreen = 'AdminUserRolesScreen',
  adminAccessLevelsScreen = 'AdminAccessLevelsScreen',
  adminBulkUserScreen = 'AdminBulkUserScreen',
  adminKaraokeScreen = 'AdminKaraokeScreen',
  adminBoardgamesScreen = 'AdminBoardgamesScreen',
  adminHuntsScreen = 'AdminHuntsScreen',
  adminHuntEditScreen = 'AdminHuntEditScreen',
  adminPuzzleEditScreen = 'AdminPuzzleEditScreen',
  huntScreen = 'HuntScreen',
  huntPuzzleScreen = 'HuntPuzzleScreen',
  huntHelpScreen = 'HuntHelpScreen',
  eventFeedbackSelectScreen = 'EventFeedbackSelectScreen',
  eventFeedbackFormScreen = 'EventFeedbackFormScreen',
  adminEventFeedbackScreen = 'AdminEventFeedbackScreen',
  adminEventFeedbackReportsScreen = 'AdminEventFeedbackReportsScreen',
  adminEventFeedbackStatsScreen = 'AdminEventFeedbackStatsScreen',
  adminEventFeedbackReportScreen = 'AdminEventFeedbackReportScreen',
  eventFeedbackHelpScreen = 'EventFeedbackHelpScreen',
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
  | CommonStackComponents.scheduleImportHelpScreen
  | CommonStackComponents.scheduleOverlapHelpScreen
  | CommonStackComponents.userDirectoryHelpScreen
  | CommonStackComponents.forumHelpScreen
  | CommonStackComponents.forumCategoriesHelpScreen
  | CommonStackComponents.forumCategoryHelpScreen
  | CommonStackComponents.forumThreadHelpScreen
  | CommonStackComponents.forumThreadCreateHelpScreen
  | CommonStackComponents.forumThreadSearchHelpScreen
  | CommonStackComponents.forumPostSearchHelpScreen
  | CommonStackComponents.forumPostMentionHelpScreen
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
  | CommonStackComponents.userProfilesHelpScreen
  | CommonStackComponents.userProfileSelfHelpScreen
  | CommonStackComponents.mapHelpScreen
  | CommonStackComponents.cruiseHelpScreen
  | CommonStackComponents.dailyThemeHelpScreen
  | CommonStackComponents.easterEggHelpScreen
  | CommonStackComponents.todayHelpScreen
  | CommonStackComponents.krakenTalkHelpScreen
  | CommonStackComponents.reportHelpScreen
  | CommonStackComponents.adminHelpScreen
  | CommonStackComponents.announcementHelpScreen
  | CommonStackComponents.registrationCodeHelpScreen
  | CommonStackComponents.adminServerSettingsHelpScreen
  | CommonStackComponents.huntHelpScreen
  | CommonStackComponents.eventFeedbackHelpScreen;

export const useCommonStack = () => useNavigation<StackNavigationProp<CommonStackParamList>>();

export const useCommonRoute = () => useRoute<RouteProp<CommonStackParamList>>();
