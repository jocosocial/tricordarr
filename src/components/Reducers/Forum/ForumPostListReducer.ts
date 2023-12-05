import {PostData} from '../../../libraries/Structs/ControllerStructs';
import {useReducer} from 'react';

export enum ForumPostListActions {
  setList = 'SET',
  updatePost = 'UPDATE_POST',
  clear = 'CLEAR',
  deletePost = 'DELETE_POST',
  appendPost = 'APPEND_POST',
  prependPost = 'PREPEND_POST',
}

export type ForumPostListActionsType =
  | {type: ForumPostListActions.setList; postList: PostData[]}
  | {type: ForumPostListActions.updatePost; newPost: PostData}
  | {type: ForumPostListActions.clear}
  | {type: ForumPostListActions.deletePost; oldPost: PostData}
  | {type: ForumPostListActions.appendPost; newPost: PostData}
  | {type: ForumPostListActions.prependPost; newPost: PostData};

const forumPostListReducer = (postList: PostData[], action: ForumPostListActionsType): PostData[] => {
  console.log('[ForumPostListReducer.ts] Got action:', action.type);
  switch (action.type) {
    case ForumPostListActions.setList: {
      return action.postList;
    }
    case ForumPostListActions.updatePost: {
      return postList.flatMap(p => {
        if (p.postID === action.newPost.postID) {
          console.log('Updating post', p.postID, p.text);
          return action.newPost;
        }
        return p;
      });
    }
    case ForumPostListActions.clear: {
      return [];
    }
    case ForumPostListActions.deletePost: {
      return postList.filter(p => p.postID !== action.oldPost.postID);
    }
    case ForumPostListActions.appendPost: {
      return postList.concat(action.newPost);
    }
    case ForumPostListActions.prependPost: {
      return [action.newPost].concat(postList);
    }
    default: {
      throw new Error('Unknown ForumPostListActions action');
    }
  }
};

export const useForumPostListReducer = (initialState: PostData[]) => useReducer(forumPostListReducer, initialState);
