import React from 'react';
import {Divider} from 'react-native-paper';

import {AdminNavigationListItem} from '#src/Components/Lists/Items/Admin/AdminNavigationListItem';
import {ListItem} from '#src/Components/Lists/ListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {ChatStackScreenComponents} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ForumStackComponents} from '#src/Navigation/Stacks/Forum/ForumStackComponents';
import {BottomTabComponents, useBottomTabNavigator} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

export const AdminScreen = () => {
  return (
    <AdminAccessScreen minAccess={'accountmanager'}>
      <AdminScreenInner />
    </AdminAccessScreen>
  );
};

/**
 * Server Admin hub, grouped to match Swiftarr's `/admin` root: Communication, Configuration, and Data Loading.
 */
const AdminScreenInner = () => {
  const access = useAdminAccess();
  const bottomTabNavigator = useBottomTabNavigator();
  const {data: userNotificationData} = useUserNotificationDataQuery();
  useAdminHelpButton();

  const ttSeamailCount = userNotificationData?.moderatorData?.newTTSeamailMessageCount ?? 0;
  const ttMentionCount = userNotificationData?.moderatorData?.newTTForumMentionCount ?? 0;

  /**
   * Opens Seamail already switched to the TwitarrTeam inbox.
   */
  const openTwitarrTeamSeamail = () => {
    bottomTabNavigator.navigate(BottomTabComponents.seamailTab, {
      screen: ChatStackScreenComponents.seamailListScreen,
      params: {asPrivilegedUser: PrivilegedUserAccounts.TwitarrTeam},
    });
  };

  /**
   * Opens forum mentions already switched to the TwitarrTeam inbox.
   */
  const openTwitarrTeamMentions = () => {
    bottomTabNavigator.navigate(BottomTabComponents.forumsTab, {
      screen: ForumStackComponents.forumPostMentionScreen,
      params: {asPrivilegedUser: PrivilegedUserAccounts.TwitarrTeam},
    });
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        {access.canManageAnnouncements && (
          <>
            <Divider bold={true} />
            <ListSection>
              <ListSubheader>Communication</ListSubheader>
              <AdminNavigationListItem
                title={'Announcements'}
                description={'Create, edit, and delete system-wide announcements.'}
                navComponent={CommonStackComponents.adminAnnouncementsScreen}
              />
              {access.canManageThemes && (
                <AdminNavigationListItem
                  title={'Daily Themes'}
                  description={'Set info for theme days, including explanatory text and pictures.'}
                  navComponent={CommonStackComponents.adminDailyThemesScreen}
                />
              )}
              <ListItem
                title={'TwitarrTeam Seamail'}
                description={
                  ttSeamailCount ? `Seamail to @twitarrteam. ${ttSeamailCount} new.` : 'Seamail to @twitarrteam.'
                }
                onPress={openTwitarrTeamSeamail}
              />
              <ListItem
                title={'TwitarrTeam Forum Mentions'}
                description={
                  ttMentionCount
                    ? `Mentions of @twitarrteam in forum posts. ${ttMentionCount} new.`
                    : 'Mentions of @twitarrteam in forum posts.'
                }
                onPress={openTwitarrTeamMentions}
              />
              <AdminNavigationListItem
                title={'Event Feedback'}
                description={'View Shadow Event Feedback responses.'}
                navComponent={CommonStackComponents.siteUIScreen}
                params={{resource: 'eventfeedback', admin: true}}
              />
            </ListSection>
          </>
        )}
        {(access.canViewSettings || access.canManageRegCodes) && (
          <>
            <Divider bold={true} />
            <ListSection>
              <ListSubheader>Configuration</ListSubheader>
              {access.canViewSettings && (
                <>
                  <AdminNavigationListItem
                    title={'Server Settings'}
                    description={
                      access.canEditSettings
                        ? 'Limits, notifications, Wi-Fi, and related server options.'
                        : 'View server settings. Only the admin account can change them.'
                    }
                    navComponent={CommonStackComponents.adminServerSettingsScreen}
                  />
                  <AdminNavigationListItem
                    title={'Disabled Features'}
                    description={'Enable or disable features per client. Disabling for All Clients turns the API off.'}
                    navComponent={CommonStackComponents.adminFeaturesScreen}
                  />
                </>
              )}
              {access.canManageRegCodes && (
                <AdminNavigationListItem
                  title={'Registration Codes'}
                  description={'Look up codes, view usage stats, and unlock password recovery.'}
                  navComponent={CommonStackComponents.adminRegCodesScreen}
                />
              )}
              {access.canAssignDiscordRegCodes && (
                <AdminNavigationListItem
                  title={'Assign Reg Code'}
                  description={'Allocate a pre-prod registration code to a Discord user. Does not work on boat.'}
                  navComponent={CommonStackComponents.adminDiscordRegCodeScreen}
                />
              )}
              {access.canManageAccessLevels && (
                <AdminNavigationListItem
                  title={'Access Levels'}
                  description={'Promote or demote Moderators, TwitarrTeam, and THO.'}
                  navComponent={CommonStackComponents.adminAccessLevelsScreen}
                />
              )}
              {access.canManageRoles && (
                <AdminNavigationListItem
                  title={'User Roles'}
                  description={'Assign roles such as Account Manager, Shutternaut, and Karaoke Manager.'}
                  navComponent={CommonStackComponents.adminUserRolesScreen}
                />
              )}
              {access.canViewRollup && (
                <AdminNavigationListItem
                  title={'Show Table Counts'}
                  description={'Database row counts for users, posts, reports, and more.'}
                  navComponent={CommonStackComponents.adminRollupScreen}
                />
              )}
            </ListSection>
          </>
        )}
        {access.canManageSchedule && (
          <>
            <Divider bold={true} />
            <ListSection>
              <ListSubheader>Data Loading</ListSubheader>
              <AdminNavigationListItem
                title={'Schedule Manager'}
                description={'Upload an ICS file, verify the diff, and apply it.'}
                navComponent={CommonStackComponents.adminScheduleScreen}
              />
              <AdminNavigationListItem
                title={'Performers'}
                description={'Manage performers and link them to their events.'}
                navComponent={CommonStackComponents.siteUIScreen}
                params={{resource: 'performer/root', admin: true}}
              />
              {access.canManageHunts && (
                <AdminNavigationListItem
                  title={'Puzzle Hunts'}
                  description={'Create and edit puzzle hunts.'}
                  navComponent={CommonStackComponents.adminHuntsScreen}
                />
              )}
              {access.canBulkUser && (
                <>
                  <AdminNavigationListItem
                    title={'User'}
                    description={'Download or upload a user archive. Server should be in admin-only mode for import.'}
                    navComponent={CommonStackComponents.adminBulkUserScreen}
                  />
                  <AdminNavigationListItem
                    title={'Karaoke'}
                    description={'Reload karaoke songs from the server seed files.'}
                    navComponent={CommonStackComponents.adminKaraokeScreen}
                  />
                  <AdminNavigationListItem
                    title={'Board Games'}
                    description={'Reload board games from the server seed files.'}
                    navComponent={CommonStackComponents.adminBoardgamesScreen}
                  />
                  <AdminNavigationListItem
                    title={'Time Zones'}
                    description={'Every time zone change we undergo during the cruise.'}
                    navComponent={CommonStackComponents.adminTimeZonesScreen}
                  />
                </>
              )}
            </ListSection>
          </>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
