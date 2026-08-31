import {QueryKey} from '@tanstack/react-query';

import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {ReportType} from '#src/Enums/ReportType';
import {
  ForumData,
  ForumModerationData,
  PostData,
  PostDetailData,
  ProfilePublicData,
  ReportModerationData,
  UserHeader,
  UserProfileUploadData,
} from '#src/Structs/ControllerStructs';

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

/**
 * Groups reports that refer to the same content. Matches Swiftarr's `generateContentGroups`.
 */
export const generateReportContentGroups = (reports: ReportModerationData[]): ReportContentGroup[] => {
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
export const getReportGroupStatusLabel = (group: ReportContentGroup): string => {
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
 * Query keys that should be invalidated after a generic moderation mutation.
 */
export const getSharedModerationCacheKeys = (): QueryKey[] => {
  return ReportModerationData.getCacheKeys();
};

/**
 * Open-reports list keeps groups with remaining open reports; closed list keeps fully closed groups.
 */
export const filterReportGroupsByClosed = (groups: ReportContentGroup[], closed: boolean): ReportContentGroup[] => {
  return groups.filter(group => (group.openCount === 0) === closed);
};

/**
 * True when the reports screen should show closed groups. Accepts boolean params and deep-link strings.
 */
export const isClosedReportsParam = (closed?: boolean | string): boolean => {
  return closed === true || closed === 'closed' || closed === 'true';
};

/**
 * ForumPostEditScreen takes PostData; the moderation API returns PostDetailData.
 */
export const postDataFromDetail = (detail: PostDetailData): PostData => {
  return {
    postID: detail.postID,
    createdAt: detail.createdAt,
    author: detail.author,
    text: detail.text,
    images: detail.images,
    isBookmarked: detail.isBookmarked,
    userLike: detail.userLike,
    likeCount: detail.laughs.length + detail.likes.length + detail.loves.length,
  };
};

/**
 * Minimal ForumData so ForumThreadEditScreen can rename a thread from moderation.
 */
export const forumDataFromModeration = (data: ForumModerationData): ForumData => {
  return {
    forumID: data.forumID,
    categoryID: data.categoryID,
    title: data.title,
    creator: data.creator,
    isLocked: data.moderationStatus === ContentModerationStatus.locked,
    isFavorite: false,
    isMuted: false,
    paginator: {total: 0, start: 0, limit: 50},
    posts: [],
  };
};

/**
 * UserProfileEditScreen takes ProfilePublicData; the moderation API returns UserProfileUploadData.
 */
export const profilePublicDataFromUpload = (profile: UserProfileUploadData): ProfilePublicData | undefined => {
  if (!profile.header) {
    return undefined;
  }
  return {
    header: profile.header,
    realName: profile.realName,
    homeLocation: profile.homeLocation,
    roomNumber: profile.roomNumber,
    email: profile.email,
    about: profile.about,
    message: profile.message,
    dinnerTeam: profile.dinnerTeam,
    discordUsername: profile.discordUsername,
    isFavorite: false,
  };
};
