import React from 'react';
import {Divider} from 'react-native-paper';

import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
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
  const {data: userNotificationData} = useUserNotificationDataQuery();
  useAdminHelpButton();

  const ttSeamailCount = userNotificationData?.moderatorData?.newTTSeamailMessageCount ?? 0;
  const ttMentionCount = userNotificationData?.moderatorData?.newTTForumMentionCount ?? 0;

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        {access.canManageAnnouncements && (
          <>
            <Divider bold={true} />
            <ListSection>
              <ListSubheader>Communication</ListSubheader>
              <NavigationListItem
                title={'Announcements'}
                description={'Create, edit, and delete system-wide announcements.'}
                navComponent={CommonStackComponents.adminAnnouncementsScreen}
              />
              <NavigationListItem
                title={'Daily Themes'}
                description={
                  access.canManageThemes
                    ? 'Set info for theme days, including explanatory text and pictures.'
                    : 'View all daily themes, including explanatory text and pictures.'
                }
                navComponent={
                  access.canManageThemes
                    ? CommonStackComponents.adminDailyThemesScreen
                    : CommonStackComponents.dailyThemesScreen
                }
              />
              <NavigationListItem
                title={'TwitarrTeam Seamail'}
                description={
                  ttSeamailCount ? `Seamail to @twitarrteam. ${ttSeamailCount} new.` : 'Seamail to @twitarrteam.'
                }
                navComponent={CommonStackComponents.seamailListScreen}
                params={{asPrivilegedUser: PrivilegedUserAccounts.TwitarrTeam, noDrawer: true}}
              />
              <NavigationListItem
                title={'TwitarrTeam Forum Mentions'}
                description={
                  ttMentionCount
                    ? `Mentions of @twitarrteam in forum posts. ${ttMentionCount} new.`
                    : 'Mentions of @twitarrteam in forum posts.'
                }
                navComponent={CommonStackComponents.forumPostMentionScreen}
                params={{asPrivilegedUser: PrivilegedUserAccounts.TwitarrTeam}}
              />
              <NavigationListItem
                title={'Event Feedback'}
                description={'Print room signs, view host reports, and download CSV.'}
                navComponent={CommonStackComponents.adminEventFeedbackScreen}
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
                  <NavigationListItem
                    title={'Server Settings'}
                    description={
                      access.canEditSettings
                        ? 'Limits, notifications, Wi-Fi, and related server options.'
                        : 'View server settings. Only the admin account can change them.'
                    }
                    navComponent={CommonStackComponents.adminServerSettingsScreen}
                  />
                  <NavigationListItem
                    title={'Disabled Features'}
                    description={'Enable or disable features per client. Disabling for All Clients turns the API off.'}
                    navComponent={CommonStackComponents.adminFeaturesScreen}
                  />
                </>
              )}
              {access.canManageRegCodes && (
                <NavigationListItem
                  title={'Registration Codes'}
                  description={'Look up codes, view usage stats, and unlock password recovery.'}
                  navComponent={CommonStackComponents.adminRegCodesScreen}
                />
              )}
              {access.canAssignDiscordRegCodes && (
                <NavigationListItem
                  title={'Assign Reg Code'}
                  description={'Allocate a pre-prod registration code to a Discord user. Does not work on boat.'}
                  navComponent={CommonStackComponents.adminDiscordRegCodeScreen}
                />
              )}
              {access.canManageAccessLevels && (
                <NavigationListItem
                  title={'Access Levels'}
                  description={'Promote or demote Moderators, TwitarrTeam, and THO.'}
                  navComponent={CommonStackComponents.adminAccessLevelsScreen}
                />
              )}
              {access.canManageRoles && (
                <NavigationListItem
                  title={'User Roles'}
                  description={'Assign roles such as Account Manager, Shutternaut, and Karaoke Manager.'}
                  navComponent={CommonStackComponents.adminUserRolesScreen}
                />
              )}
              {access.canViewRollup && (
                <NavigationListItem
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
              <NavigationListItem
                title={'Schedule Manager'}
                description={'Upload an ICS file, verify the diff, and apply it.'}
                navComponent={CommonStackComponents.siteUIScreen}
                params={{resource: 'schedule', admin: true}}
              />
              <NavigationListItem
                title={'Performers'}
                description={'Manage performers and link them to their events.'}
                navComponent={CommonStackComponents.siteUIScreen}
                params={{resource: 'performer/root', admin: true}}
              />
              {access.canManageHunts && (
                <NavigationListItem
                  title={'Puzzle Hunts'}
                  description={'Create and edit puzzle hunts.'}
                  navComponent={CommonStackComponents.siteUIScreen}
                  params={{resource: 'hunts', admin: true}}
                />
              )}
              {access.canBulkUser && (
                <>
                  <NavigationListItem
                    title={'User'}
                    description={'Download or upload a user archive. Server should be in admin-only mode for import.'}
                    navComponent={CommonStackComponents.adminBulkUserScreen}
                  />
                  <NavigationListItem
                    title={'Karaoke'}
                    description={'Reload karaoke songs from the server seed files.'}
                    navComponent={CommonStackComponents.adminKaraokeScreen}
                  />
                  <NavigationListItem
                    title={'Board Games'}
                    description={'Reload board games from the server seed files.'}
                    navComponent={CommonStackComponents.adminBoardgamesScreen}
                  />
                  <NavigationListItem
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
