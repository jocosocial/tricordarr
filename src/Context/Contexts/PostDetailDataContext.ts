import {createContext, useContext} from 'react';

import {LikeType} from '#src/Enums/LikeType';
import {PostDetailData} from '#src/Structs/ControllerStructs';

export interface PostDetailDataContextType {
  hasUserReacted: (postData: PostDetailData, userID: string, likeType?: LikeType) => boolean;
}

export const PostDetailDataContext = createContext(<PostDetailDataContextType>{});

/**
 * Pure derivation helpers for PostDetailData. Provided as a context (rather than a plain
 * hook) so consumers get stable function references across renders - see AppImageContext.ts
 * for the full rationale.
 */
export const usePostDetailData = () => useContext(PostDetailDataContext);
