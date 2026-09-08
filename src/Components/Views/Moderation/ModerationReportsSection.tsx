import React, {useMemo} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {ModerationReportGroupListItem} from '#src/Components/Lists/Items/Moderation/ModerationReportGroupListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ReportContentGroup} from '#src/Libraries/Moderation/ReportContentGroup';
import {ReportModerationData} from '#src/Structs/ControllerStructs';

interface ModerationReportsSectionProps {
  reports: ReportModerationData[];
  emptyMessage?: string;
}

/**
 * Grouped reports section. User moderate screens pass filings against that user's content.
 */
export const ModerationReportsSection = ({
  reports,
  emptyMessage = "No reports against this user's content.",
}: ModerationReportsSectionProps) => {
  const groups = useMemo(() => ReportContentGroup.groupsFromReports(reports), [reports]);

  return (
    <View>
      <ListSection>
        <ListSubheader>Reports</ListSubheader>
      </ListSection>
      {groups.length === 0 ? (
        <PaddedContentView padTop={true}>
          <Text>{emptyMessage}</Text>
        </PaddedContentView>
      ) : (
        groups.map(group => (
          <ModerationReportGroupListItem key={`${group.reportType}-${group.reportedID}`} group={group} />
        ))
      )}
    </View>
  );
};
