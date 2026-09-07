import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {ModerationReportListItem} from '#src/Components/Lists/Items/Moderation/ModerationReportListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ReportModerationData} from '#src/Structs/ControllerStructs';

interface ModerationContentReportsSectionViewProps {
  reports: ReportModerationData[];
  emptyMessage?: string;
}

/**
 * Reports section on a content moderate screen. Renders a header, an empty message, or one row per report.
 */
export const ModerationContentReportsSectionView = ({
  reports,
  emptyMessage = 'No reports on this content.',
}: ModerationContentReportsSectionViewProps) => {
  return (
    <View>
      <ListSection>
        <ListSubheader>Reports</ListSubheader>
      </ListSection>
      {reports.length === 0 ? (
        <PaddedContentView padTop={true}>
          <Text>{emptyMessage}</Text>
        </PaddedContentView>
      ) : (
        reports.map(report => <ModerationReportListItem key={report.id} report={report} />)
      )}
    </View>
  );
};
