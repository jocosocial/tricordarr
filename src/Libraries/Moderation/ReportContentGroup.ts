import {ReportType} from '#src/Enums/ReportType';
import {ReportModerationData, UserHeader} from '#src/Structs/ControllerStructs';

/**
 * A set of reports that all refer to the same piece of content.
 * Mirrors Swiftarr's `ReportContentGroup`.
 */

export interface ReportContentGroup {
  reportType: ReportType;
  reportedID: string;
  reportedUser: UserHeader;
  firstReport: ReportModerationData;
  openCount: number;
  handledBy?: UserHeader;
  reports: ReportModerationData[];
}
