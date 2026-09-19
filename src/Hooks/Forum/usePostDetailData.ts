import {LikeType} from '#src/Enums/LikeType';
import {PostDetailData} from '#src/Structs/ControllerStructs';

export const usePostDetailData = () => {
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

  return {hasUserReacted};
};
