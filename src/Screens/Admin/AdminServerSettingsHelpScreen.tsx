import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

/**
 * Help for server settings. One topic per setting, matching the Server Settings form.
 */
export const AdminServerSettingsHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            These options control site-wide limits, notifications, and access. TwitarrTeam can view them. Only the admin
            account can save changes.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Access'}>
          <HelpTopicView title={'Minimum Access Level'}>
            Only users at this level or above can use the full site. Banned (All Users) leaves the site open. Higher
            values lock the site down to staff. Users below the minimum are logged out of most routes.
          </HelpTopicView>
          <HelpTopicView title={'Enable Pre-Registration'}>
            When on, users below the minimum access level can still create accounts, log in, and edit their profile in a
            restricted pre-embark UI. When off, account creation is disabled and only elevated users may log in.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Features'}>
          <HelpTopicView title={'Allow Animated Images'}>
            When off, animated uploads are converted to static JPEGs. Does not change images that were already uploaded.
          </HelpTopicView>
          <HelpTopicView title={'Site Notification Data Caching'}>
            Caches notification data in website sessions, normally up to 60 seconds. Turning this off on the boat can
            hurt website performance. Useful for debugging the Site UI in real time.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Limits'}>
          <HelpTopicView title={'Max Alternate Accounts'}>
            How many alt accounts a primary user may create.
          </HelpTopicView>
          <HelpTopicView title={'Maximum Twarrts'}>Maximum twarrts returned in a single request.</HelpTopicView>
          <HelpTopicView title={'Maximum Forums'}>Maximum forums returned in a single request.</HelpTopicView>
          <HelpTopicView title={'Maximum Forum Posts'}>Maximum forum posts returned in a single request.</HelpTopicView>
          <HelpTopicView title={'Max Image Size'}>Largest image upload allowed, in bytes.</HelpTopicView>
          <HelpTopicView title={'Max Images Per Forum Post'}>How many images a forum post may attach.</HelpTopicView>
          <HelpTopicView title={'Photostream Upload Rate Limit'}>
            Minimum seconds a user must wait between Photostream uploads. 0 disables the limit.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Reporting'}>
          <HelpTopicView title={'Forum Auto-Quarantine Threshold'}>
            Reports needed to automatically quarantine a forum.
          </HelpTopicView>
          <HelpTopicView title={'Post Auto-Quarantine Threshold'}>
            Reports needed to automatically quarantine a twarrt or forum post.
          </HelpTopicView>
          <HelpTopicView title={'User Auto-Quarantine Threshold'}>
            Reports needed to automatically quarantine a user.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Notifications'}>
          <HelpTopicView title={'Upcoming Event Notification'}>
            Seconds before an event or LFG to fire upcoming notifications.
          </HelpTopicView>
          <HelpTopicView title={'Upcoming Event Notifications'}>
            Disabled skips event notifications. Cruise Week fires them as if the device were on the cruise calendar.
            Current Time uses the real date and time.
          </HelpTopicView>
          <HelpTopicView title={'Upcoming LFG Notifications'}>
            Same choices as event notifications, applied to joined LFGs.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Other'}>
          <HelpTopicView title={'Ship Wi-Fi SSID'}>
            Name of the onboard Wi-Fi network. Clients receive this from the notification endpoint.
          </HelpTopicView>
          <HelpTopicView title={'Schedule Update URL'}>
            ICS URL used when reloading the schedule from the network, usually a sched.com all.ics link.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
