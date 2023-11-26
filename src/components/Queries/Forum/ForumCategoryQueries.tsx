import {useTokenAuthQuery} from '../TokenAuthQuery';
import {CategoryData} from '../../../libraries/Structs/ControllerStructs';

export const useForumCategoriesQuery = () => {
  return useTokenAuthQuery<CategoryData[]>({
    queryKey: ['/forum/categories'],
  });
};

export const useForumCategoryQuery = (categoryId: string) => {
  return useTokenAuthQuery<CategoryData>({
    queryKey: [`/forum/categories/${categoryId}`],
  });
};
