import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
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
        <HelpChapterTitleView title={'Floating Action Button'}>
          <HelpFABView icon={AppIcons.moderator} label={'Actions'} />
          <HelpTopicView>
            On a forum post moderate screen, press Actions in the lower right to handle reports or moderate the author.
            Start Handling All and Close All are hidden if there are no open reports.
          </HelpTopicView>
          <HelpTopicView title={'Start Handling All'} icon={AppIcons.markAsRead}>
            Marks all open reports on this content as being handled by you.
          </HelpTopicView>
          <HelpTopicView title={'Close All'} icon={AppIcons.close}>
            Closes all open reports on this content.
          </HelpTopicView>
          <HelpTopicView title={'Mod User'} icon={AppIcons.user}>
            Open account-level moderation for the post author.
          </HelpTopicView>
        </HelpChapterTitleView>
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
        <HelpTopicView title={'View in Context'}>
          On a forum post moderate screen, View in Context opens the forum thread at this post.
        </HelpTopicView>
        <HelpTopicView title={'Edit'} icon={AppIcons.edit}>
          Edit the forum post text and images. Hidden if the post has already been deleted.
        </HelpTopicView>
        <HelpTopicView title={'Delete'} icon={AppIcons.delete}>
          Permanently delete the forum post. There is no recovery. Hidden if the post has already been deleted.
        </HelpTopicView>
        <HelpChapterTitleView title={'Posting'} />
        <HelpTopicView>
          When you are posting as Moderator the post button will be a different color. In some circumstances you will
          also see a red banner at the top of the screen.
        </HelpTopicView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Privileged Actions'} />
        <HelpTopicView>
          Moderators can quarantine or restore users and apply a temporary quarantine. THO can also ban or unverify.
          Every action is written to the Moderator Log.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
