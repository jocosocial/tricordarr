import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

/**
 * Help for Shadow Event Feedback admin: hub actions, reports list, detail, and download.
 */
export const EventFeedbackHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Shadow Event Feedback collects reports from hosts after their shadow events and workshops. TwitarrTeam and
            above can review those reports, print room signs, and export a CSV.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Hub'}>
          <HelpTopicView title={'Print Room Signs'} icon={AppIcons.webview}>
            Opens the website to edit the room list and print QR-code signs that send hosts to the feedback form.
          </HelpTopicView>
          <HelpTopicView title={'View Feedback Responses'} icon={AppIcons.feedback}>
            Native list of submitted reports. Stats appear first, then each report with the event, host name, and filed
            date. Tap a report for the full text.
          </HelpTopicView>
          <HelpTopicView title={'Feedback Table'} icon={AppIcons.webview}>
            Opens the website spreadsheet-style table of every report field on one page.
          </HelpTopicView>
          <HelpTopicView title={'Download'} icon={AppIcons.download}>
            Builds a CSV of all reports. Save it to a folder on the device or share it with another app.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Report Details'}>
          <HelpTopicView>
            The detail screen shows the event, location, time, reporting user, host name, attendance, recap, issues,
            follow count, forum post count, and filed date. Tap the event, user, or forum row to open that screen when a
            link is available.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Privileged Actions'}>
          <HelpTopicView title={'Actionable'} icon={AppIcons.check}>
            On a report, toggle Actionable when the host described something that needs follow-up. This flag is only
            visible to TwitarrTeam and above.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
