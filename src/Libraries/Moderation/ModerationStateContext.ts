import {QueryKey} from '@tanstack/react-query';

import {ModerationSetStatePath} from '#src/Queries/Moderation/ModerationMutations';
import {
  FezModerationData,
  FezPostModerationData,
  ForumModerationData,
  ForumPostModerationData,
  ProfileModerationData,
} from '#src/Structs/ControllerStructs';

/**
 * True when the reports screen should show closed groups. Accepts boolean params and deep-link strings.
 */
export const isClosedReportsParam = (closed?: boolean | string): boolean => {
  return closed === true || closed === 'closed' || closed === 'true';
};

/**
 * Union of per-content moderation payloads that support Set State.
 */
export type ModeratedContentData =
  ForumPostModerationData | ForumModerationData | FezModerationData | FezPostModerationData | ProfileModerationData;

/**
 * Set-state path, content ID, and cache keys derived from a moderate-screen payload.
 */
export interface ModerationStateContext {
  path: ModerationSetStatePath;
  contentID: string;
  cacheKeys: QueryKey[];
  isDeleted: boolean;
}
