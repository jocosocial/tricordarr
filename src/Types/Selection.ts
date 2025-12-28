import {ForumListData} from '#src/Structs/ControllerStructs';

export interface Selectable {
  id: string;
}

export namespace Selectable {
  export const fromForumListData = (forumListData: ForumListData): Selectable => {
    return {
      id: forumListData.forumID,
    };
  };
}
