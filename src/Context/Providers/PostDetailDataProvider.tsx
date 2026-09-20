import React, {PropsWithChildren} from 'react';

import {PostDetailDataContext, PostDetailDataContextType} from '#src/Context/Contexts/PostDetailDataContext';
import {LikeType} from '#src/Enums/LikeType';
import {PostDetailData} from '#src/Structs/ControllerStructs';

const hasUserReacted = (postData: PostDetailData, userID: string, likeType?: LikeType) => {
  if (!likeType) {
    return !!postData.userLike;
  }
  switch (likeType) {
    case LikeType.like:
      return postData.likes.flatMap(uh => uh.userID).includes(userID);
    case LikeType.laugh:
      return postData.laughs.flatMap(uh => uh.userID).includes(userID);
    case LikeType.love:
      return postData.loves.flatMap(uh => uh.userID).includes(userID);
  }
};

const postDetailDataContextValue: PostDetailDataContextType = {hasUserReacted};

export const PostDetailDataProvider = ({children}: PropsWithChildren) => {
  return <PostDetailDataContext.Provider value={postDetailDataContextValue}>{children}</PostDetailDataContext.Provider>;
};
