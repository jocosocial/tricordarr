import React from 'react';
import {Linking} from 'react-native';
import {Divider} from 'react-native-paper';

import {AdminNavigationListItem} from '#src/Components/Lists/Items/Admin/AdminNavigationListItem';
import {ListItem} from '#src/Components/Lists/ListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {appSiteUrl} from '#src/Libraries/UrlParser';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

export const AdminScreen = () => {
  return (
    <AdminAccessScreen minAccess={'accountmanager'}>
      <AdminScreenInner />
    </AdminAccessScreen>
  );
};

const AdminScreenInner = () => {
  const access = useAdminAccess();
  useAdminHelpButton();

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        {access.canManageAnnouncements && (
          <>
            <Divider bold={true} />
            <ListSection>
              <ListSubheader>Content</ListSubheader>
              <AdminNavigationListItem
                title={'Announcements'}
                description={'Create and edit server-wide announcements.'}
                navComponent={CommonStackComponents.adminAnnouncementsScreen}
              />
              {access.canManageThemes && (
                <AdminNavigationListItem
                  title={'Daily Themes'}
                  description={'Create and edit daily themes for each cruise day.'}
                  navComponent={CommonStackComponents.adminDailyThemesScreen}
                />
              )}
              {access.canManageHunts && (
                <AdminNavigationListItem
                  title={'Puzzle Hunts'}
                  description={'Create and edit puzzle hunts.'}
                  navComponent={CommonStackComponents.adminHuntsScreen}
                />
              )}
            </ListSection>
          </>
        )}
        {access.canViewSettings && (
          <>
            <Divider bold={true} />
            <ListSection>
              <ListSubheader>Server</ListSubheader>
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
              <AdminNavigationListItem
                title={'Server Counts'}
                description={'Database row counts for users, posts, reports, and more.'}
                navComponent={CommonStackComponents.adminRollupScreen}
              />
              <AdminNavigationListItem
                title={'Time Zones'}
                description={'Scheduled time zone changes during the cruise.'}
                navComponent={CommonStackComponents.adminTimeZonesScreen}
              />
            </ListSection>
          </>
        )}
        {access.canManageSchedule && (
          <>
            <Divider bold={true} />
            <ListSection>
              <ListSubheader>Schedule</ListSubheader>
              <AdminNavigationListItem
                title={'Schedule Update'}
                description={'Upload an ICS file, verify the diff, and apply it.'}
                navComponent={CommonStackComponents.adminScheduleScreen}
              />
            </ListSection>
          </>
        )}
        {access.canManageRegCodes && (
          <>
            <Divider bold={true} />
            <ListSection>
              <ListSubheader>Accounts</ListSubheader>
              <AdminNavigationListItem
                title={'Registration Codes'}
                description={'Look up codes, view usage stats, and unlock password recovery.'}
                navComponent={CommonStackComponents.adminRegCodesScreen}
              />
              {access.canAssignDiscordRegCodes && (
                <AdminNavigationListItem
                  title={'Discord Registration Codes'}
                  description={'Allocate a pre-prod registration code to a Discord user.'}
                  navComponent={CommonStackComponents.adminDiscordRegCodeScreen}
                />
              )}
            </ListSection>
          </>
        )}
        {access.canManageAccessLevels && (
          <>
            <Divider bold={true} />
            <ListSection>
              <ListSubheader>Privileges</ListSubheader>
              <AdminNavigationListItem
                title={'Access Levels'}
                description={'Promote or demote Moderators, TwitarrTeam, and THO.'}
                navComponent={CommonStackComponents.adminAccessLevelsScreen}
              />
              <AdminNavigationListItem
                title={'User Roles'}
                description={'Assign roles such as Account Manager, Shutternaut, and Karaoke Manager.'}
                navComponent={CommonStackComponents.adminUserRolesScreen}
              />
            </ListSection>
          </>
        )}
        {access.canBulkUser && (
          <>
            <Divider bold={true} />
            <ListSection>
              <ListSubheader>Admin Only</ListSubheader>
              <AdminNavigationListItem
                title={'Bulk User Import'}
                description={'Download or upload a user archive. Server should be in admin-only mode for import.'}
                navComponent={CommonStackComponents.adminBulkUserScreen}
              />
              <AdminNavigationListItem
                title={'Karaoke Catalog'}
                description={'Reload karaoke songs from the server seed files.'}
                navComponent={CommonStackComponents.adminKaraokeScreen}
              />
              <AdminNavigationListItem
                title={'Board Game Catalog'}
                description={'Reload board games from the server seed files.'}
                navComponent={CommonStackComponents.adminBoardgamesScreen}
              />
            </ListSection>
          </>
        )}
        <Divider bold={true} />
        <ListSection>
          <ListSubheader>Web UI</ListSubheader>
          <ListItem
            title={'Open Server Admin in Web UI'}
            description={'Performer bulk import, event feedback, and other tools still on the website.'}
            onPress={() => Linking.openURL(appSiteUrl('admin'))}
          />
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
