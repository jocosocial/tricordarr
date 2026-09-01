import React from 'react';
import {Text} from 'react-native-paper';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {EventFeedbackReport} from '#src/Structs/ControllerStructs';

interface EventFeedbackReportListItemProps {
  report: EventFeedbackReport;
  onPress: () => void;
}

/**
 * List row for a feedback report: event title, host name, and filed date.
 */
export const EventFeedbackReportListItem = ({report, onPress}: EventFeedbackReportListItemProps) => {
  const filedDate = report.reportModDate ? new Date(report.reportModDate) : undefined;

  return (
    <DataFieldListItem
      title={report.eventTitle}
      onPress={onPress}
      description={
        <Text>
          By {report.hostName}
          {'\n'}
          Filed {filedDate ? <RelativeTimeTag date={filedDate} /> : 'unknown'}
        </Text>
      }
    />
  );
};
