import {RouteProp} from '@react-navigation/native';
import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';

type EventFeedbackHelpScreenRouteProp = RouteProp<CommonStackParamList, 'EventFeedbackHelpScreen'>;

interface EventFeedbackHelpScreenProps {
  route: EventFeedbackHelpScreenRouteProp;
}

/**
 * Help for Shadow Event Feedback. Host form by default; pass `{mode: 'admin'}` for TwitarrTeam actions.
 */
export const EventFeedbackHelpScreen = ({route}: EventFeedbackHelpScreenProps) => {
  const isAdmin = route.params?.mode === 'admin';

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Shadow Event Feedback is for people who hosted a shadow event or workshop to give feedback to THO about
            their event. Event hosts should pick the event that they hosted, fill in the report, and submit. Switch to
            Yours to view or edit what you sent.
          </HelpTopicView>
          {isAdmin && <HelpTopicView>THO can review the reports, print room signs, and export the data.</HelpTopicView>}
        </HelpChapterTitleView>
        {isAdmin ? (
          <>
            <HelpChapterTitleView title={'Admin Screens'}>
              <HelpTopicView title={'Print Room Signs'}>
                Opens the website to edit the room list and print QR-code signs that send hosts to the feedback form.
              </HelpTopicView>
              <HelpTopicView title={'View Feedback Responses'}>
                View a list of submitted reports. Tap a report for the full text. Marked reports show the Actionable
                icon. On a report, tap Location to open the deck map. Long press Location for Reports In This Room or
                Events In This Room. Tap Reporting User for that person's reports.
              </HelpTopicView>
              <HelpTopicView title={'Feedback Table'}>
                Opens the website spreadsheet-style table of every report field on one page. Useful for copying to a
                spreadsheet tool.
              </HelpTopicView>
              <HelpTopicView title={'Download'}>
                Builds a CSV of all reports. Save it to a folder on the device or share it with another app.
              </HelpTopicView>
            </HelpChapterTitleView>
            <HelpChapterTitleView title={'Actions'}>
              <HelpTopicView title={'Filter'} icon={AppIcons.filter}>
                On the full responses list, filter reports by room. Long press the filter button to clear the filter.
                The filter is hidden when the list is already limited to a room or user.
              </HelpTopicView>
              <HelpTopicView title={'Stats'} icon={AppIcons.statistics}>
                On the full responses list, open Stats for shadow event counts, how many reports have been received, and
                the response rate. Hidden when the list is already limited to a room or user.
              </HelpTopicView>
              <HelpTopicView title={'Actionable'} icon={AppIcons.actionable}>
                On a report, tap Actionable in the header when the host described something that needs follow-up. The
                icon is highlighted when the report is marked.
              </HelpTopicView>
            </HelpChapterTitleView>
          </>
        ) : (
          <HelpChapterTitleView title={'Actions'}>
            <HelpButtonHelpTopicView />
          </HelpChapterTitleView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
