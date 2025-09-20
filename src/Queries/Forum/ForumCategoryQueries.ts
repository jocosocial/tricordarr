import {ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';
import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {CategoryData} from '#src/Structs/ControllerStructs';

export const useForumCategoriesQuery = () => {
  return useTokenAuthQuery<CategoryData[]>('/forum/categories');
};

export interface ForumCategoryQueryParams {
  sort?: ForumSort;
  start?: number;
  limit?: number;
  afterdate?: string; // mutually exclusive
  beforedate?: string; // mutually exclusive
  order?: ForumSortDirection;
}

export const useForumCategoryQuery = (categoryId: string, queryParams: ForumCategoryQueryParams = {}) => {
  return useTokenAuthPaginationQuery<CategoryData, ForumCategoryQueryParams>(
    `/forum/categories/${categoryId}`,
    undefined,
    queryParams,
  );
};
