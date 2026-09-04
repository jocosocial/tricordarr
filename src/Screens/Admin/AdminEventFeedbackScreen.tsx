import React from 'react';

import {AdminNavigationListItem} from '#src/Components/Lists/Items/Admin/AdminNavigationListItem';
import {ListItem} from '#src/Components/Lists/ListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {
  buildEventFeedbackCsv,
  EVENT_FEEDBACK_CSV_BASENAME,
  EVENT_FEEDBACK_CSV_MIME,
} from '#src/Libraries/Admin/EventFeedbackCsv';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventFeedbackDownloadMutation} from '#src/Queries/Admin/EventFeedbackMutations';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

/**
 * Shadow Event Feedback admin hub, matching Swiftarr's `/admin/eventfeedback`.
 */
export const AdminEventFeedbackScreen = () => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminEventFeedbackScreenInner />
    </AdminAccessScreen>
  );
};

const AdminEventFeedbackScreenInner = () => {
  const downloadMutation = useEventFeedbackDownloadMutation();
  const {openDownloadSheet} = useDownloadSheet();
  useAdminHelpButton(CommonStackComponents.eventFeedbackHelpScreen, {mode: 'admin'});

  /**
   * Fetches all reports, builds a CSV, and presents the download sheet.
   */
  const handleDownload = () => {
    downloadMutation.mutate(undefined, {
      onSuccess: reports => {
        openDownloadSheet({
          title: 'Download CSV',
          baseName: EVENT_FEEDBACK_CSV_BASENAME,
          mimeType: EVENT_FEEDBACK_CSV_MIME,
          contents: buildEventFeedbackCsv(reports),
        });
      },
    });
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>Admin Actions</ListSubheader>
          <AdminNavigationListItem
            title={'Print Room Signs'}
            description={'Print a sign for each room where shadow events will be held.'}
            navComponent={CommonStackComponents.siteUIScreen}
            params={{resource: 'eventfeedback', id: 'roomposters', admin: true}}
          />
          <AdminNavigationListItem
            title={'View Feedback Responses'}
            description={'View reports from shadow event hosts.'}
            navComponent={CommonStackComponents.adminEventFeedbackReportsScreen}
          />
          <AdminNavigationListItem
            title={'Feedback Table'}
            description={'View reports on a single page, as a table.'}
            navComponent={CommonStackComponents.siteUIScreen}
            params={{resource: 'eventfeedback', id: 'reports', action: 'table', admin: true}}
          />
          <ListItem
            title={'Download'}
            description={downloadMutation.isPending ? 'Preparing CSV…' : 'Download all the reports as a CSV file.'}
            onPress={handleDownload}
            disabled={downloadMutation.isPending}
          />
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
