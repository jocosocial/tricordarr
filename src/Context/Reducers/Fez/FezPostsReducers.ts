import {useReducer} from 'react';

import {createLogger} from '#src/Libraries/Logger';
import {FezPostData} from '#src/Structs/ControllerStructs';

const logger = createLogger('FezPostsReducers.ts');

export enum FezPostsActions {
  appendPost = 'APPEND_POST',
  set = 'SET',
}

export type FezPostsActionsType =
  | {type: FezPostsActions.set; fezPosts: FezPostData[]}
  | {type: FezPostsActions.appendPost; fezPostData: FezPostData};

const fezPostsReducer = (fezPosts: FezPostData[] = [], action: FezPostsActionsType) => {
  logger.debug('Got action:', action.type);
  switch (action.type) {
    case FezPostsActions.set: {
      return action.fezPosts;
    }
    case FezPostsActions.appendPost: {
      let posts = fezPosts;
      if (posts.some(p => p.postID === action.fezPostData.postID)) {
        // This is probably a React-ism like you have duplicate listeners because
        // React development is hard.
        logger.warn('Skipping appendPost for ID', action.fezPostData.postID);
        return posts;
      }
      posts.unshift(action.fezPostData);
      return posts;
    }
    default: {
      throw new Error('Unknown FezAction action');
    }
  }
};

export const useFezPostsReducer = (initialState: FezPostData[] = []) => useReducer(fezPostsReducer, initialState);
