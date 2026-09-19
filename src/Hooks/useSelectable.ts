import {FezData, ForumListData, UserHeader} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

/**
 * Factory functions for building `Selectable` items from domain data.
 */
export const useSelectable = () => {
  const fromForumListData = (forumListData: ForumListData): Selectable => {
    return {
      id: forumListData.forumID,
    };
  };

  const fromFezData = (fezData: FezData): Selectable => {
    return {
      id: fezData.fezID,
    };
  };

  const fromUserHeader = (userHeader: UserHeader): Selectable => {
    return {
      id: userHeader.userID,
    };
  };

  return {fromForumListData, fromFezData, fromUserHeader};
};
