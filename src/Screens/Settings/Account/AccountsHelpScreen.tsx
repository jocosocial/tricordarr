import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const AccountsHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Overview'}>
          <HelpTopicView>
            Every account you have logged in to on this device is listed here. The check marks the account you are using
            now.
          </HelpTopicView>
          <HelpTopicView title={'nobody'} icon={AppIcons.anonymous}>
            Browsing a server without being logged in. Logging in from it replaces the row with your account. Settings
            changed while not logged in become the starting settings for accounts you add later.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Account Badges'}>
          <HelpTopicView title={'Signed out'}>
            You signed this account out of this device. Tap it to log in again.
          </HelpTopicView>
          <HelpTopicView title={'Signed out remotely'}>
            The server no longer accepts this account's login, usually because you logged out all devices from somewhere
            else. Tap it to log in again.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Add Account'} icon={AppIcons.new}>
            Walks through the same steps as first-time setup: pick a server (it is checked first), then log in, create
            an account (after accepting the code of conduct), or proceed without one. Nothing is signed out, and nothing
            changes until you finish.
          </HelpTopicView>
          <HelpTopicView title={'Sign Out'} icon={AppIcons.logout}>
            Signs the account out of this device only. Its row stays so you can sign back in quickly.
          </HelpTopicView>
          <HelpTopicView title={'Remove'} icon={AppIcons.delete}>
            Deletes the account's saved login, settings and cached content from this device. It does not delete the
            account on the server. On a nobody row it deletes that row's cached content.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Notifications'}>
          <HelpTopicView>
            Only the account you are currently using receives notifications. Switching accounts moves them to the new
            account.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
