import {File, Paths} from 'expo-file-system';
import React from 'react';
import Share from 'react-native-share';

import {AdminNavigationListItem} from '#src/Components/Lists/Items/Admin/AdminNavigationListItem';
import {ListItem} from '#src/Components/Lists/ListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {buildEventFeedbackCsv, EVENT_FEEDBACK_CSV_FILENAME} from '#src/Libraries/Admin/EventFeedbackCsv';
import {createLogger} from '#src/Libraries/Logger';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventFeedbackDownloadMutation} from '#src/Queries/Admin/EventFeedbackMutations';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

const logger = createLogger('AdminEventFeedbackScreen.tsx');

const isPickerCancelled = (error: unknown) => error instanceof Error && /cancell?ed/i.test(error.message);

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
  const {setSnackbarPayload} = useSnackbar();
  useAdminHelpButton(CommonStackComponents.eventFeedbackHelpScreen);

  const handleDownload = () => {
    downloadMutation.mutate(undefined, {
      onSuccess: async reports => {
        try {
          const csv = buildEventFeedbackCsv(reports);
          const file = new File(Paths.cache, EVENT_FEEDBACK_CSV_FILENAME);
          file.create({intermediates: true, overwrite: true});
          file.write(csv);
          await Share.open({
            url: file.uri,
            type: 'text/csv',
            filename: EVENT_FEEDBACK_CSV_FILENAME,
            failOnCancel: false,
          });
        } catch (error) {
          if (isPickerCancelled(error) || (error instanceof Error && /did not share/i.test(error.message))) {
            return;
          }
          logger.error('Failed to share event feedback CSV', error);
          setSnackbarPayload({message: `Could not share CSV: ${error}`, messageType: 'error'});
        }
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
