import {ForumListData} from '#src/Structs/ControllerStructs';

/**
 * A selectable item. This is used to identify an item that can be selected in a list.
 * It should not contain any significant data about the item itself.
 *
 * Implement additional `fromThing` methods for specific types of items.
 */
export interface Selectable {
  id: string;
}

export namespace Selectable {
  /**
   * Create a Selectable from a ForumListData.
   * @param forumListData - The ForumListData to create a Selectable from.
   * @returns A Selectable with the forumID as the id.
   */
  export const fromForumListData = (forumListData: ForumListData): Selectable => {
    return {
      id: forumListData.forumID,
    };
  };
}
