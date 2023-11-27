import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery';
import {CategoryData, ForumData, ForumListData} from '../../../libraries/Structs/ControllerStructs';

export const useForumCategoriesQuery = () => {
  return useTokenAuthQuery<CategoryData[]>({
    queryKey: ['/forum/categories'],
  });
};

// @TODO this paginates based on query params not on data returned
export const useForumCategoryQuery = (categoryId: string) => {
  return useTokenAuthQuery<CategoryData>({
    queryKey: [`/forum/categories/${categoryId}`],
  });
};

export const useForumThreadQuery = (forumID: string) => {
  return useTokenAuthPaginationQuery<ForumData>(`/forum/${forumID}`);
};
