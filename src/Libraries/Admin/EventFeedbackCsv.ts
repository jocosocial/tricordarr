import moment from 'moment-timezone';

import {EventFeedbackReport, EventFeedbackStats} from '#src/Structs/ControllerStructs';

/** Basename without extension; SAF/createFile add .csv from the mime type. */
export const EVENT_FEEDBACK_CSV_BASENAME = 'event_feedback_reports';
export const EVENT_FEEDBACK_CSV_FILENAME = `${EVENT_FEEDBACK_CSV_BASENAME}.csv`;
export const EVENT_FEEDBACK_CSV_MIME = 'text/csv';

const CSV_HEADERS = [
  'Twitarr Username',
  'Display Name',
  'Real Name',
  'Mod Date',
  'Event UID',
  'Event Title',
  'Location',
  'Start Time',
  'Attendance',
  'Recap',
  'Issues',
  'Follow Count',
  'Forum Post Count',
  'Actionable',
];

/**
 * Quotes a CSV field, doubling any embedded quotes to match Swiftarr's download formatter.
 */
const csvEscape = (value: string): string => {
  return `"${value.replace(/"/g, '""')}"`;
};

/**
 * Formats a report timestamp the way Swiftarr's CSV download does (`MMM d, h:mm a z`).
 */
const formatCsvDate = (iso?: string): string => {
  if (!iso) {
    return 'no date';
  }
  return moment(iso).format('MMM D, h:mm A z');
};

/**
 * Builds a UTF-8 CSV (with BOM) of all feedback reports, matching
 * `GET /admin/eventfeedback/reports/download` on the Swiftarr site.
 */
export const buildEventFeedbackCsv = (reports: EventFeedbackReport[]): string => {
  const headerLine = CSV_HEADERS.map(csvEscape).join(',') + '\n';
  const body = reports
    .map(report => {
      const fields = [
        report.reportingUser.username,
        report.reportingUser.displayName ?? '',
        report.hostName,
        formatCsvDate(report.reportModDate),
        report.event?.uid ?? '',
        report.eventTitle,
        report.eventLocation,
        formatCsvDate(report.eventTime),
        report.attendance,
        report.recapString,
        report.issuesString,
        `${report.adminFields?.followCount ?? 0}`,
        `${report.adminFields?.forumPostCount ?? 0}`,
        report.adminFields?.actionable === true ? 'true' : '',
      ];
      return fields.map(csvEscape).join(',') + '\n';
    })
    .join('');
  return `\uFEFF${headerLine}${body}`;
};

/**
 * Response rate as unique events with feedback over completed shadow events, one decimal percent.
 */
export const getEventFeedbackResponseRate = (stats: EventFeedbackStats): string => {
  if (stats.completedShadowEvents === 0) {
    return '0.0%';
  }
  const rate = (stats.uniqueEventsWithFeedback / stats.completedShadowEvents) * 100;
  return `${rate.toFixed(1)}%`;
};
