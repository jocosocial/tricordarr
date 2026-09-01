import {RouteProp} from '@react-navigation/native';
import React from 'react';

import {FezType} from '#src/Enums/FezType';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {
  USER_RELATION_SCREEN_TITLES,
  USER_RELATION_SEARCH_SCREEN_TITLES,
} from '#src/Queries/Users/UserRelationConstants';
import {AdminAccessLevelsScreen} from '#src/Screens/Admin/AdminAccessLevelsScreen';
import {AdminAnnouncementEditScreen} from '#src/Screens/Admin/AdminAnnouncementEditScreen';
import {AdminAnnouncementsScreen} from '#src/Screens/Admin/AdminAnnouncementsScreen';
import {AdminBoardgamesScreen} from '#src/Screens/Admin/AdminBoardgamesScreen';
import {AdminBulkUserScreen} from '#src/Screens/Admin/AdminBulkUserScreen';
import {AdminDailyThemeEditScreen} from '#src/Screens/Admin/AdminDailyThemeEditScreen';
import {AdminDailyThemesScreen} from '#src/Screens/Admin/AdminDailyThemesScreen';
import {AdminDiscordRegCodeScreen} from '#src/Screens/Admin/AdminDiscordRegCodeScreen';
import {AdminEventFeedbackReportScreen} from '#src/Screens/Admin/AdminEventFeedbackReportScreen';
import {AdminEventFeedbackReportsScreen} from '#src/Screens/Admin/AdminEventFeedbackReportsScreen';
import {AdminEventFeedbackScreen} from '#src/Screens/Admin/AdminEventFeedbackScreen';
import {AdminFeaturesScreen} from '#src/Screens/Admin/AdminFeaturesScreen';
import {AdminHelpScreen} from '#src/Screens/Admin/AdminHelpScreen';
import {AdminHuntEditScreen} from '#src/Screens/Admin/AdminHuntEditScreen';
import {AdminHuntsScreen} from '#src/Screens/Admin/AdminHuntsScreen';
import {AdminKaraokeScreen} from '#src/Screens/Admin/AdminKaraokeScreen';
import {AdminPuzzleEditScreen} from '#src/Screens/Admin/AdminPuzzleEditScreen';
import {AdminRegCodesScreen} from '#src/Screens/Admin/AdminRegCodesScreen';
import {AdminRollupScreen} from '#src/Screens/Admin/AdminRollupScreen';
import {AdminScheduleLogScreen} from '#src/Screens/Admin/AdminScheduleLogScreen';
import {AdminScheduleScreen} from '#src/Screens/Admin/AdminScheduleScreen';
import {AdminScheduleVerifyScreen} from '#src/Screens/Admin/AdminScheduleVerifyScreen';
import {AdminScreen} from '#src/Screens/Admin/AdminScreen';
import {AdminServerSettingsScreen} from '#src/Screens/Admin/AdminServerSettingsScreen';
import {AdminTimeZonesScreen} from '#src/Screens/Admin/AdminTimeZonesScreen';
import {AdminUserRolesScreen} from '#src/Screens/Admin/AdminUserRolesScreen';
import {AnnouncementHelpScreen} from '#src/Screens/Admin/AnnouncementHelpScreen';
import {EventFeedbackHelpScreen} from '#src/Screens/Admin/EventFeedbackHelpScreen';
import {BoardgameHelpScreen} from '#src/Screens/Boardgames/BoardgameHelpScreen';
import {DisabledHelpScreen} from '#src/Screens/Disabled/DisabledHelpScreen';
import {PreRegistrationHelpScreen} from '#src/Screens/Disabled/PreRegistrationHelpScreen';
import {EventAddPerformerScreen} from '#src/Screens/Event/EventAddPerformerScreen';
import {EventScreen} from '#src/Screens/Event/EventScreen';
import {EventSearchScreen} from '#src/Screens/Event/EventSearchScreen';
import {EventSettingsScreen} from '#src/Screens/Event/EventSettingsScreen';
import {EventFeedbackFormScreen} from '#src/Screens/EventFeedback/EventFeedbackFormScreen';
import {EventFeedbackSelectScreen} from '#src/Screens/EventFeedback/EventFeedbackSelectScreen';
import {FezChatDetailsHelpScreen} from '#src/Screens/Fez/FezChatDetailsHelpScreen';
import {FezChatDetailsScreen} from '#src/Screens/Fez/FezChatDetailsScreen';
import {FezChatHelpScreen} from '#src/Screens/Fez/FezChatHelpScreen';
import {FezChatScreen} from '#src/Screens/Fez/FezChatScreen';
import {ForumCategoriesHelpScreen} from '#src/Screens/Forum/ForumCategoriesHelpScreen';
import {ForumCategoryHelpScreen} from '#src/Screens/Forum/ForumCategoryHelpScreen';
import {ForumHelpScreen} from '#src/Screens/Forum/ForumHelpScreen';
import {ForumPostMentionHelpScreen} from '#src/Screens/Forum/ForumPostMentionHelpScreen';
import {ForumPostSearchHelpScreen} from '#src/Screens/Forum/ForumPostSearchHelpScreen';
import {ForumThreadCreateHelpScreen} from '#src/Screens/Forum/ForumThreadCreateHelpScreen';
import {ForumThreadHelpScreen} from '#src/Screens/Forum/ForumThreadHelpScreen';
import {ForumThreadSearchHelpScreen} from '#src/Screens/Forum/ForumThreadSearchHelpScreen';
import {KeywordsHelpScreen} from '#src/Screens/Forum/KeywordsHelpScreen';
import {ForumPostEditScreen} from '#src/Screens/Forum/Post/ForumPostEditScreen';
import {ForumPostHashtagScreen} from '#src/Screens/Forum/Post/ForumPostHashtagScreen';
import {ForumPostMentionScreen} from '#src/Screens/Forum/Post/ForumPostMentionScreen';
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
import {HuntHelpScreen} from '#src/Screens/Hunts/HuntHelpScreen';
import {HuntPuzzleScreen} from '#src/Screens/Hunts/HuntPuzzleScreen';
import {HuntScreen} from '#src/Screens/Hunts/HuntScreen';
import {KaraokeHelpScreen} from '#src/Screens/Karaoke/KaraokeHelpScreen';
import {KrakenTalkActiveCallScreen} from '#src/Screens/KrakenTalk/KrakenTalkActiveCallScreen';
import {KrakenTalkCreateScreen} from '#src/Screens/KrakenTalk/KrakenTalkCreateScreen';
import {KrakenTalkHelpScreen} from '#src/Screens/KrakenTalk/KrakenTalkHelpScreen';
import {LfgAddParticipantScreen} from '#src/Screens/LFG/LfgAddParticipantScreen';
import {LfgCreateHelpScreen} from '#src/Screens/LFG/LfgCreateHelpScreen';
import {LfgCreateScreen} from '#src/Screens/LFG/LfgCreateScreen';
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
import {ReportHelpScreen} from '#src/Screens/Moderation/ReportHelpScreen';
import {ReportScreen} from '#src/Screens/Moderation/ReportScreen';
import {PerformerCreateScreen} from '#src/Screens/Performer/PerformerCreateScreen';
import {PerformerEditScreen} from '#src/Screens/Performer/PerformerEditScreen';
import {PerformerHelpScreen} from '#src/Screens/Performer/PerformerHelpScreen';
import {PerformerScreen} from '#src/Screens/Performer/PerformerScreen';
import {PersonalEventCreateScreen} from '#src/Screens/PersonalEvent/PersonalEventCreateScreen';
import {PersonalEventEditScreen} from '#src/Screens/PersonalEvent/PersonalEventEditScreen';
import {PersonalEventScreen} from '#src/Screens/PersonalEvent/PersonalEventScreen';
import {PhotostreamEventScreen} from '#src/Screens/Photostream/PhotostreamEventScreen';
import {PhotostreamHelpScreen} from '#src/Screens/Photostream/PhotostreamHelpScreen';
import {PhotostreamUserScreen} from '#src/Screens/Photostream/PhotostreamUserScreen';
import {EventHelpScreen} from '#src/Screens/Schedule/EventHelpScreen';
import {PersonalEventHelpScreen} from '#src/Screens/Schedule/PersonalEventHelpScreen';
import {ScheduleDayHelpScreen} from '#src/Screens/Schedule/ScheduleDayHelpScreen';
import {ScheduleDayPlannerHelpScreen} from '#src/Screens/Schedule/ScheduleDayPlannerHelpScreen';
import {ScheduleDayPlannerScreen} from '#src/Screens/Schedule/ScheduleDayPlannerScreen';
import {ScheduleDayScreen} from '#src/Screens/Schedule/ScheduleDayScreen';
import {ScheduleHelpScreen} from '#src/Screens/Schedule/ScheduleHelpScreen';
import {ScheduleImportHelpScreen} from '#src/Screens/Schedule/ScheduleImportHelpScreen';
import {ScheduleImportScreen} from '#src/Screens/Schedule/ScheduleImportScreen';
import {ScheduleOverlapHelpScreen} from '#src/Screens/Schedule/ScheduleOverlapHelpScreen';
import {ScheduleOverlapScreen} from '#src/Screens/Schedule/ScheduleOverlapScreen';
import {SeamailAddParticipantScreen} from '#src/Screens/Seamail/SeamailAddParticipantScreen';
import {SeamailCreateHelpScreen} from '#src/Screens/Seamail/SeamailCreateHelpScreen';
import {SeamailCreateScreen} from '#src/Screens/Seamail/SeamailCreateScreen';
import {SeamailEditScreen} from '#src/Screens/Seamail/SeamailEditScreen';
import {SeamailHelpScreen} from '#src/Screens/Seamail/SeamailHelpScreen';
import {SeamailListHelpScreen} from '#src/Screens/Seamail/SeamailListHelpScreen';
import {SeamailListScreen} from '#src/Screens/Seamail/SeamailListScreen';
import {SeamailSearchHelpScreen} from '#src/Screens/Seamail/SeamailSearchHelpScreen';
import {SeamailSearchScreen} from '#src/Screens/Seamail/SeamailSearchScreen';
import {AccessibilitySettingsScreen} from '#src/Screens/Settings/AccessibilitySettingsScreen';
import {AccountRecoveryScreen} from '#src/Screens/Settings/Account/AccountRecoveryScreen';
import {RecoveryKeyScreen} from '#src/Screens/Settings/Account/RecoveryKeyScreen';
import {ChatSettingsScreen} from '#src/Screens/Settings/ChatSettingsScreen';
import {ConfigServerUrlScreen} from '#src/Screens/Settings/Config/ConfigServerUrlScreen';
import {AlertKeywordsScreen} from '#src/Screens/Settings/Content/AlertKeywordsSettingsScreen';
import {ForumSettingsScreen} from '#src/Screens/Settings/Content/ForumSettingsScreen';
import {ImageSettingsScreen} from '#src/Screens/Settings/Content/ImageSettingsScreen';
import {MuteKeywordsScreen} from '#src/Screens/Settings/Content/MuteKeywordsSettingsScreen';
import {ShareSettingsScreen} from '#src/Screens/Settings/Content/ShareSettingsScreen';
import {CruiseSettingsScreen} from '#src/Screens/Settings/Developer/CruiseSettingsScreen';
import {SiteUIHelpScreen} from '#src/Screens/SiteUI/SiteUIHelpScreen';
import {SiteUILinkScreen} from '#src/Screens/SiteUI/SiteUILinkScreen';
import {SiteUIScreen} from '#src/Screens/SiteUI/SiteUIScreen';
import {SearchUsersScreen} from '#src/Screens/User/SearchUsersScreen';
import {UserDirectoryHelpScreen} from '#src/Screens/User/UserDirectoryHelpScreen';
import {UsernameProfileScreen} from '#src/Screens/User/UsernameProfileScreen';
import {UserPrivateNoteScreen} from '#src/Screens/User/UserPrivateNoteScreen';
import {UserProfileEditScreen} from '#src/Screens/User/UserProfileEditScreen';
import {UserProfileHelpScreen} from '#src/Screens/User/UserProfileHelpScreen';
import {UserProfileScreen} from '#src/Screens/User/UserProfileScreen';
import {UserProfileSelfHelpScreen} from '#src/Screens/User/UserProfileSelfHelpScreen';
import {UserProfilesHelpScreen} from '#src/Screens/User/UserProfilesHelpScreen';
import {UserRegCodeScreen} from '#src/Screens/User/UserRegCodeScreen';
import {UserSelfProfileScreen} from '#src/Screens/User/UserSelfProfileScreen';
import {UsersListScreen} from '#src/Screens/User/UsersListScreen';

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
        name={CommonStackComponents.recoveryKeyScreen}
        component={RecoveryKeyScreen}
        options={{title: 'Recovery Key', gestureEnabled: false, headerLeft: () => null}}
      />
      <Stack.Screen name={CommonStackComponents.reportScreen} component={ReportScreen} options={{title: 'Report'}} />
      <Stack.Screen
        name={CommonStackComponents.reportHelpScreen}
        component={ReportHelpScreen}
        options={{title: 'Report Help'}}
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
        name={CommonStackComponents.photostreamUserScreen}
        component={PhotostreamUserScreen}
        options={{title: 'User Photos'}}
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
        name={CommonStackComponents.seamailListScreen}
        component={SeamailListScreen}
        options={{title: 'Seamail'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailSearchScreen}
        component={SeamailSearchScreen}
        options={{title: 'Search Seamail'}}
      />
      <Stack.Screen
        name={CommonStackComponents.seamailCreateScreen}
        component={SeamailCreateScreen}
        options={{title: 'New Seamail'}}
      />
      <Stack.Screen
        name={CommonStackComponents.forumPostMentionScreen}
        component={ForumPostMentionScreen}
        options={{title: 'Posts Mentioning You'}}
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
        name={CommonStackComponents.lfgCreateScreen}
        component={LfgCreateScreen}
        options={{title: 'New LFG'}}
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
        name={CommonStackComponents.shareSettingsScreen}
        component={ShareSettingsScreen}
        options={{title: 'Share Settings'}}
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
        name={CommonStackComponents.userProfilesHelpScreen}
        component={UserProfilesHelpScreen}
        options={{title: 'User Profiles Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.userProfileSelfHelpScreen}
        component={UserProfileSelfHelpScreen}
        options={{title: 'Your Profile Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.usersList}
        component={UsersListScreen}
        options={({route}: {route: RouteProp<CommonStackParamList, 'UsersListScreen'>}) => ({
          title: USER_RELATION_SCREEN_TITLES[route.params?.mode ?? 'favorite'],
        })}
      />
      <Stack.Screen
        name={CommonStackComponents.searchUsers}
        component={SearchUsersScreen}
        options={({route}: {route: RouteProp<CommonStackParamList, 'SearchUsersScreen'>}) => ({
          title: USER_RELATION_SEARCH_SCREEN_TITLES[route.params.mode],
        })}
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
        name={CommonStackComponents.forumPostMentionHelpScreen}
        component={ForumPostMentionHelpScreen}
        options={{title: 'Mentions Help'}}
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
        name={CommonStackComponents.scheduleImportHelpScreen}
        component={ScheduleImportHelpScreen}
        options={{title: 'Schedule Import Help'}}
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
        name={CommonStackComponents.chatSettingsScreen}
        component={ChatSettingsScreen}
        options={{title: 'Chat Settings'}}
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
        name={CommonStackComponents.cruiseSettingsScreen}
        component={CruiseSettingsScreen}
        options={{title: 'Cruise Settings'}}
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
      <Stack.Screen
        name={CommonStackComponents.krakenTalkCreateScreen}
        component={KrakenTalkCreateScreen}
        options={{title: 'New Call'}}
      />
      <Stack.Screen
        name={CommonStackComponents.krakenTalkActiveCallScreen}
        component={KrakenTalkActiveCallScreen}
        options={{title: 'Call', headerShown: false}}
      />
      <Stack.Screen
        name={CommonStackComponents.krakenTalkHelpScreen}
        component={KrakenTalkHelpScreen}
        options={{title: 'KrakenTalk Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminScreen}
        component={AdminScreen}
        options={{title: 'Server Admin'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminHelpScreen}
        component={AdminHelpScreen}
        options={{title: 'Server Admin Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminAnnouncementsScreen}
        component={AdminAnnouncementsScreen}
        options={{title: 'Announcements'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminAnnouncementEditScreen}
        component={AdminAnnouncementEditScreen}
        options={{title: 'Announcement'}}
      />
      <Stack.Screen
        name={CommonStackComponents.announcementHelpScreen}
        component={AnnouncementHelpScreen}
        options={{title: 'Announcement Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminDailyThemesScreen}
        component={AdminDailyThemesScreen}
        options={{title: 'Daily Themes'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminDailyThemeEditScreen}
        component={AdminDailyThemeEditScreen}
        options={{title: 'Daily Theme'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminServerSettingsScreen}
        component={AdminServerSettingsScreen}
        options={{title: 'Server Settings'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminFeaturesScreen}
        component={AdminFeaturesScreen}
        options={{title: 'Disabled Features'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminRollupScreen}
        component={AdminRollupScreen}
        options={{title: 'Server Counts'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminTimeZonesScreen}
        component={AdminTimeZonesScreen}
        options={{title: 'Time Zones'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminScheduleScreen}
        component={AdminScheduleScreen}
        options={{title: 'Schedule Update'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminScheduleVerifyScreen}
        component={AdminScheduleVerifyScreen}
        options={{title: 'Verify Schedule'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminScheduleLogScreen}
        component={AdminScheduleLogScreen}
        options={{title: 'Schedule Log'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminRegCodesScreen}
        component={AdminRegCodesScreen}
        options={{title: 'Registration Codes'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminDiscordRegCodeScreen}
        component={AdminDiscordRegCodeScreen}
        options={{title: 'Discord Codes'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminUserRolesScreen}
        component={AdminUserRolesScreen}
        options={{title: 'User Roles'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminAccessLevelsScreen}
        component={AdminAccessLevelsScreen}
        options={{title: 'Access Levels'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminBulkUserScreen}
        component={AdminBulkUserScreen}
        options={{title: 'Bulk User Import'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminKaraokeScreen}
        component={AdminKaraokeScreen}
        options={{title: 'Karaoke Catalog'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminBoardgamesScreen}
        component={AdminBoardgamesScreen}
        options={{title: 'Board Game Catalog'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminHuntsScreen}
        component={AdminHuntsScreen}
        options={{title: 'Puzzle Hunts'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminHuntEditScreen}
        component={AdminHuntEditScreen}
        options={{title: 'Hunt'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminPuzzleEditScreen}
        component={AdminPuzzleEditScreen}
        options={{title: 'Puzzle'}}
      />
      <Stack.Screen name={CommonStackComponents.huntScreen} component={HuntScreen} options={{title: 'Puzzle Hunt'}} />
      <Stack.Screen
        name={CommonStackComponents.huntPuzzleScreen}
        component={HuntPuzzleScreen}
        options={{title: 'Puzzle'}}
      />
      <Stack.Screen
        name={CommonStackComponents.huntHelpScreen}
        component={HuntHelpScreen}
        options={{title: 'Puzzle Hunt Help'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminEventFeedbackScreen}
        component={AdminEventFeedbackScreen}
        options={{title: 'Shadow Event Feedback'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminEventFeedbackReportsScreen}
        component={AdminEventFeedbackReportsScreen}
        options={{title: 'Feedback Responses'}}
      />
      <Stack.Screen
        name={CommonStackComponents.adminEventFeedbackReportScreen}
        component={AdminEventFeedbackReportScreen}
        options={{title: 'Feedback Report'}}
      />
      <Stack.Screen
        name={CommonStackComponents.eventFeedbackSelectScreen}
        component={EventFeedbackSelectScreen}
        options={{title: 'Event Feedback'}}
      />
      <Stack.Screen
        name={CommonStackComponents.eventFeedbackFormScreen}
        component={EventFeedbackFormScreen}
        options={{title: 'Event Feedback'}}
      />
      <Stack.Screen
        name={CommonStackComponents.eventFeedbackHelpScreen}
        component={EventFeedbackHelpScreen}
        options={{title: 'Event Feedback Help'}}
      />
    </>
  );
};
