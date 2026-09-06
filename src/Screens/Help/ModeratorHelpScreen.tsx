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
            On a content moderate screen, press Actions in the lower right to handle reports or moderate the author.
            Handle All and Close All are hidden if there are no open reports.
          </HelpTopicView>
          <HelpTopicView title={'Handle All Reports'} icon={AppIcons.markAsRead}>
            Marks all open reports on this content as being handled by you.
          </HelpTopicView>
          <HelpTopicView title={'Close All Reports'} icon={AppIcons.close}>
            Closes all open reports on this content.
          </HelpTopicView>
          <HelpTopicView title={'Moderate User'} icon={AppIcons.user}>
            Open account-level moderation for the content author.
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
          Opens the public view for this content, such as the forum thread at a post, the LFG or chat, or the user
          profile. Seamail posts confirm before opening the private conversation.
        </HelpTopicView>
        <HelpTopicView title={'Edit'} icon={AppIcons.edit}>
          Edit the content. Disabled if the item has already been deleted, or for types that cannot be edited such as
          fez posts and photostream photos.
        </HelpTopicView>
        <HelpTopicView title={'Delete'} icon={AppIcons.delete}>
          Permanently delete the content. There is no recovery. Disabled if the item has already been deleted. User
          profiles cannot be deleted.
        </HelpTopicView>
        <HelpChapterTitleView title={'Posting'} />
        <HelpTopicView>
          When you are posting as Moderator the post button will be a different color. In some circumstances you will
          also see a red banner at the top of the screen.
        </HelpTopicView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Share'} icon={AppIcons.share}>
            On a content moderate screen, opens a menu to share a public content link or a Moderator View link.
          </HelpTopicView>
          <HelpTopicView title={'Content'} icon={AppIcons.forum}>
            Share the public link for this content. The icon matches the content type. Hidden for photostream photos and
            Micro Karaoke songs, which have no public item link.
          </HelpTopicView>
          <HelpTopicView title={'Moderator View'} icon={AppIcons.moderator}>
            Share a link that opens this moderate screen.
          </HelpTopicView>
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
