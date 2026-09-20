import {createContext, useContext} from 'react';

import {
  ModeratedContentData,
  ModerationStateContext as ModerationStateData,
} from '#src/Libraries/Moderation/ModerationStateContext';
import {ReportContentGroup} from '#src/Libraries/Moderation/ReportContentGroup';
import {ReportModerationData} from '#src/Structs/ControllerStructs';

export interface ModerationContextType {
  fromData: (data: ModeratedContentData) => ModerationStateData;
  groupsFromReports: (reports: ReportModerationData[]) => ReportContentGroup[];
  getStatusLabel: (group: ReportContentGroup) => string;
  filterByClosed: (groups: ReportContentGroup[], closed: boolean) => ReportContentGroup[];
}

export const ModerationContext = createContext(<ModerationContextType>{});

/**
 * Pure moderation-domain helpers: deriving set-state path/content ID/cache keys from
 * moderate-screen data (`fromData`), and grouping/labeling/filtering moderation reports
 * (the rest). Combined into one context since both hooks were the same domain with no
 * cross-dependency. Distinct from `src/Libraries/Moderation/ModerationStateContext.ts`,
 * which is a plain type module (not a React context) that this context's `fromData`
 * returns instances of. Provided as a context (rather than plain hooks) so consumers get
 * stable function references across renders - see AppImageContext.ts for the full
 * rationale.
 */
export const useModeration = () => useContext(ModerationContext);
