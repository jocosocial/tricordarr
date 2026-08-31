import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ModeratorHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView icon={AppIcons.moderator}>
          The moderator icon indicates a moderator action. Moderate opens an in-app screen for that content: current
          text, edit history, reports, and actions such as edit, delete, set state, and moderate the user. Quartermaster
          still opens in the webview because that feature is not in the app.
        </HelpTopicView>
        <HelpChapterTitleView title={'Moderator Actions'} />
        <HelpTopicView>
          Open Moderator Actions from the app drawer, or Moderator Summary on Today. That hub lists open and closed
          reports, the moderator log, seamail to @moderator, forum mentions of @moderator, Micro Karaoke review, and the
          Moderator Guide.
        </HelpTopicView>
        <HelpTopicView title={'Reports'}>
          Open Reports groups filings that refer to the same content. Start Handling All marks them as yours; Close All
          when you are done. Closed Reports shows groups with no remaining open filings.
        </HelpTopicView>
        <HelpTopicView title={'Content screens'}>
          Set State can mark content normal, quarantined, moderator reviewed, or locked. Auto-quarantined is assigned by
          the server when enough users report the same item. Photostream photos can be deleted but not quarantined.
        </HelpTopicView>
        <HelpChapterTitleView title={'Posting'} />
        <HelpTopicView>
          When you are posting as Moderator the post button will be a different color. In some circumstances you will
          also see a red banner at the top of the screen.
        </HelpTopicView>
        <HelpChapterTitleView title={'Privileged Actions'} />
        <HelpTopicView>
          Moderators can quarantine or restore users and apply a temporary quarantine. THO can also ban or unverify.
          Every action is written to the Moderator Log.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
