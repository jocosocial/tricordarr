import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery';
import {CategoryData} from '../../../Libraries/Structs/ControllerStructs';
import {ForumSort, ForumSortDirection} from '../../../Libraries/Enums/ForumSortFilter';

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
