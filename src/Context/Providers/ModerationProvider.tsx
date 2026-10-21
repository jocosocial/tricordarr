import React, {PropsWithChildren} from 'react';

import {ModerationContext, ModerationContextType} from '#src/Context/Contexts/ModerationContext';
import {
  ModeratedContentData,
  ModerationStateContext as ModerationStateData,
} from '#src/Libraries/Moderation/ModerationStateContext';
import {ReportContentGroup} from '#src/Libraries/Moderation/ReportContentGroup';
import {
  FezModerationData,
  FezPostModerationData,
  ForumModerationData,
  ForumPostModerationData,
  ProfileModerationData,
  ReportModerationData,
} from '#src/Structs/ControllerStructs';

/**
 * Derives set-state path, content ID, and cache keys from moderate-screen data.
 */
const fromData = (data: ModeratedContentData): ModerationStateData => {
  if ('forumPost' in data) {
    const contentID = String(data.forumPost.postID);
    return {
      path: 'forumpost',
      contentID,
      cacheKeys: ForumPostModerationData.getCacheKeys(contentID, data.forumPost.forumID),
      isDeleted: data.isDeleted,
    };
  }
  if ('fezPost' in data) {
    const contentID = String(data.fezPost.postID);
    return {
      path: 'fezpost',
      contentID,
      cacheKeys: FezPostModerationData.getCacheKeys(contentID, data.fezID),
      isDeleted: data.isDeleted,
    };
  }
  if ('fez' in data) {
    return {
      path: 'fez',
      contentID: data.fez.fezID,
      cacheKeys: FezModerationData.getCacheKeys(data.fez.fezID),
      isDeleted: data.isDeleted,
    };
  }
  if ('profile' in data) {
    const userID = data.profile.header?.userID;
    return {
      path: 'profile',
      contentID: userID ?? '',
      cacheKeys: ProfileModerationData.getCacheKeys(userID),
      isDeleted: false,
    };
  }
  return {
    path: 'forum',
    contentID: data.forumID,
    cacheKeys: ForumModerationData.getCacheKeys(data.forumID, data.categoryID),
    isDeleted: data.isDeleted,
  };
};

/**
 * Groups reports that refer to the same content. Matches Swiftarr's `generateContentGroups`.
 */
export const groupsFromReports = (reports: ReportModerationData[]): ReportContentGroup[] => {
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
export const getStatusLabel = (group: ReportContentGroup): string => {
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
export const filterByClosed = (groups: ReportContentGroup[], closed: boolean): ReportContentGroup[] => {
  return groups.filter(group => (group.openCount === 0) === closed);
};

const moderationContextValue: ModerationContextType = {fromData, groupsFromReports, getStatusLabel, filterByClosed};

export const ModerationProvider = ({children}: PropsWithChildren) => {
  return <ModerationContext.Provider value={moderationContextValue}>{children}</ModerationContext.Provider>;
};
