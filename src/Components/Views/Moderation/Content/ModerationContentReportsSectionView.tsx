import React from 'react';
import {View} from 'react-native';

import {ModerationReportListItem} from '#src/Components/Lists/Items/Moderation/ModerationReportListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {ModerationContentNoReportsView} from '#src/Components/Views/Moderation/Content/ModerationContentNoReportsView';
import {ReportModerationData} from '#src/Structs/ControllerStructs';

interface ModerationContentReportsSectionViewProps {
  reports: ReportModerationData[];
}

/**
 * Reports section on a content moderate screen. Renders a header, an empty message, or one row per report.
 */
export const ModerationContentReportsSectionView = ({reports}: ModerationContentReportsSectionViewProps) => {
  return (
    <View>
      <ListSection>
        <ListSubheader>Reports</ListSubheader>
      </ListSection>
      {reports.length === 0 ? (
        <ModerationContentNoReportsView />
      ) : (
        reports.map(report => <ModerationReportListItem key={report.id} report={report} />)
      )}
    </View>
  );
};
