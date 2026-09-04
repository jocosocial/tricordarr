jest.mock('#src/Libraries/Logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('@react-navigation/stack', () => ({
  StackNavigationProp: {},
}));

import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {ReportType} from '#src/Enums/ReportType';
import {
  filterReportGroupsByClosed,
  generateReportContentGroups,
  getReportGroupStatusLabel,
  isClosedReportsParam,
} from '#src/Libraries/Moderation';
import {parseDeepLinkUrl} from '#src/Libraries/RouteDefinitions';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ReportModerationData, UserHeader} from '#src/Structs/ControllerStructs';

const author: UserHeader = {
  userID: 'author-1',
  username: 'reporter',
};

const reportedUser: UserHeader = {
  userID: 'user-1',
  username: 'target',
};

const report = (
  overrides: Partial<ReportModerationData> &
    Pick<ReportModerationData, 'id' | 'reportedID' | 'isClosed' | 'creationTime'>,
): ReportModerationData => {
  return {
    type: ReportType.forumPost,
    reportedUser,
    author,
    updateTime: overrides.creationTime,
    ...overrides,
  };
};

describe('generateReportContentGroups', () => {
  it('groups reports for the same content and keeps the earliest firstReport', () => {
    const reports = [
      report({
        id: 'r2',
        reportedID: 'post-1',
        isClosed: false,
        creationTime: '2026-03-02T12:00:00.000Z',
      }),
      report({
        id: 'r1',
        reportedID: 'post-1',
        isClosed: true,
        creationTime: '2026-03-01T12:00:00.000Z',
      }),
      report({
        id: 'r3',
        reportedID: 'post-2',
        isClosed: false,
        creationTime: '2026-03-03T12:00:00.000Z',
      }),
    ];

    const groups = generateReportContentGroups(reports);
    expect(groups).toHaveLength(2);
    expect(groups[0].reportedID).toBe('post-1');
    expect(groups[0].reports).toHaveLength(2);
    expect(groups[0].openCount).toBe(1);
    expect(groups[0].firstReport.id).toBe('r1');
    expect(groups[1].reportedID).toBe('post-2');
  });
});

describe('filterReportGroupsByClosed', () => {
  it('keeps groups with remaining open reports on the open list', () => {
    const groups = generateReportContentGroups([
      report({
        id: 'open',
        reportedID: 'a',
        isClosed: false,
        creationTime: '2026-03-01T00:00:00.000Z',
      }),
      report({
        id: 'closed',
        reportedID: 'b',
        isClosed: true,
        creationTime: '2026-03-01T00:00:00.000Z',
      }),
    ]);
    expect(filterReportGroupsByClosed(groups, false).map(group => group.reportedID)).toEqual(['a']);
    expect(filterReportGroupsByClosed(groups, true).map(group => group.reportedID)).toEqual(['b']);
  });
});

describe('getReportGroupStatusLabel', () => {
  it('summarizes a single open report', () => {
    const [group] = generateReportContentGroups([
      report({
        id: 'open',
        reportedID: 'a',
        isClosed: false,
        creationTime: '2026-03-01T00:00:00.000Z',
      }),
    ]);
    expect(getReportGroupStatusLabel(group)).toBe('1 open report by @reporter');
  });
});

describe('isClosedReportsParam', () => {
  it('accepts boolean and deep-link string values', () => {
    expect(isClosedReportsParam(true)).toBe(true);
    expect(isClosedReportsParam('closed')).toBe(true);
    expect(isClosedReportsParam('true')).toBe(true);
    expect(isClosedReportsParam(false)).toBe(false);
    expect(isClosedReportsParam(undefined)).toBe(false);
  });
});

describe('ContentModerationStatus.getApiParameter', () => {
  it('maps reviewed to the setstate path segment', () => {
    expect(ContentModerationStatus.getApiParameter(ContentModerationStatus.modReviewed)).toBe('reviewed');
    expect(ContentModerationStatus.getApiParameter(ContentModerationStatus.normal)).toBe('normal');
    expect(ContentModerationStatus.getApiParameter(ContentModerationStatus.quarantined)).toBe('quarantined');
    expect(ContentModerationStatus.getApiParameter(ContentModerationStatus.locked)).toBe('locked');
  });
});

describe('ReportType.getLabel', () => {
  it('returns short labels used in lists', () => {
    expect(ReportType.getLabel(ReportType.forumPost)).toBe('forum post');
    expect(ReportType.getLabel(ReportType.fez)).toBe('LFG');
    expect(ReportType.getLabel(ReportType.streamPhoto)).toBe('photostream photo');
  });
});

describe('moderator deep links', () => {
  it('parses hub, reports, and per-content moderate paths', () => {
    expect(parseDeepLinkUrl('moderator')).toEqual({
      screen: CommonStackComponents.moderatorRootScreen,
    });
    expect(parseDeepLinkUrl('reports')).toEqual({
      screen: CommonStackComponents.moderatorReportsScreen,
    });
    expect(parseDeepLinkUrl('reports/closed')).toEqual({
      screen: CommonStackComponents.moderatorReportsScreen,
      params: {closed: 'closed'},
    });
    expect(parseDeepLinkUrl('moderate/forumpost/abc')).toEqual({
      screen: CommonStackComponents.forumPostModerateScreen,
      params: {id: 'abc'},
    });
    expect(parseDeepLinkUrl('moderate/lfg/fez-1')).toEqual({
      screen: CommonStackComponents.fezModerateScreen,
      params: {id: 'fez-1'},
    });
    expect(parseDeepLinkUrl('moderator/guide')).toEqual({
      screen: CommonStackComponents.moderatorGuideScreen,
    });
  });
});
