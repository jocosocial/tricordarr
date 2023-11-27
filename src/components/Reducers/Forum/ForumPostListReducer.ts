import {PostData} from '../../../libraries/Structs/ControllerStructs';
import {useReducer} from 'react';

export enum ForumPostListActions {
  setList = 'SET',
  updatePost = 'UPDATE_POST',
}

export type ForumPostListActionsType =
  | {type: ForumPostListActions.setList; postList: PostData[]}
  | {type: ForumPostListActions.updatePost; newPost: PostData};

const forumPostListReducer = (postList: PostData[], action: ForumPostListActionsType): PostData[] => {
  console.log('forumPostListReducer got action', action.type);
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
    default: {
      throw new Error('Unknown ForumPostListActions action');
    }
  }
};

export const useForumPostListReducer = (initialState: PostData[]) => useReducer(forumPostListReducer, initialState);
