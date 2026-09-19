import {ReportContentGroup} from '#src/Libraries/Moderation/ReportContentGroup';
import {ReportModerationData} from '#src/Structs/ControllerStructs';

export const useReportContentGroup = () => {
  /**
   * Groups reports that refer to the same content. Matches Swiftarr's `generateContentGroups`.
   */
  const groupsFromReports = (reports: ReportModerationData[]): ReportContentGroup[] => {
    const groups: ReportContentGroup[] = [];
    for (const report of reports) {
      const existingIndex = groups.findIndex(
        group => group.reportedID === report.reportedID && group.reportType === report.type,
      );
      if (existingIndex >= 0) {
        const existing = groups[existingIndex];
        const openCount = existing.openCount + (report.isClosed ? 0 : 1);
        const firstReport =
          new Date(existing.firstReport.creationTime) > new Date(report.creationTime) ? report : existing.firstReport;
        groups[existingIndex] = {
          ...existing,
          openCount,
          handledBy: report.handledBy ?? existing.handledBy,
          firstReport,
          reports: [...existing.reports, report],
        };
        continue;
      }
      groups.push({
        reportType: report.type,
        reportedID: report.reportedID,
        reportedUser: report.reportedUser,
        firstReport: report,
        openCount: report.isClosed ? 0 : 1,
        handledBy: report.handledBy,
        reports: [report],
      });
    }
    return groups;
  };

  /**
   * Summary line for a report group, matching Swiftarr's reports list copy.
   */
  const getStatusLabel = (group: ReportContentGroup): string => {
    if (group.reports.length === 1) {
      if (group.handledBy) {
        return group.openCount === 0
          ? `Closed by @${group.handledBy.username}`
          : `Being handled by @${group.handledBy.username}`;
      }
      if (group.openCount === 0) {
        return '1 closed report';
      }
      return `1 open report by @${group.reports[0].author.username}`;
    }
    if (group.openCount === 0) {
      return `${group.reports.length} closed reports`;
    }
    return `${group.reports.length} reports, ${group.openCount} open`;
  };

  /**
   * Open-reports list keeps groups with remaining open reports; closed list keeps fully closed groups.
   */
  const filterByClosed = (groups: ReportContentGroup[], closed: boolean): ReportContentGroup[] => {
    return groups.filter(group => (group.openCount === 0) === closed);
  };

  return {groupsFromReports, getStatusLabel, filterByClosed};
};
