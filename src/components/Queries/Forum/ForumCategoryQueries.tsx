import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery';
import {CategoryData, ForumData} from '../../../libraries/Structs/ControllerStructs';

export const useForumCategoriesQuery = () => {
  return useTokenAuthQuery<CategoryData[]>({
    queryKey: ['/forum/categories'],
  });
};

// @TODO infinite
export const useForumCategoryQuery = (categoryId: string) => {
  return useTokenAuthQuery<CategoryData>({
    queryKey: [`/forum/categories/${categoryId}`],
  });
};

export const useForumThreadQuery = (forumID: string) => {
  return useTokenAuthPaginationQuery<ForumData>(`/forum/${forumID}`, 50);
};
