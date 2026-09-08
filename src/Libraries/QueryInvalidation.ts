import {QueryKey, useQueryClient} from '@tanstack/react-query';

/**
 * Invalidates every provided query key. Used after moderation mutations.
 */
export const invalidateQueryKeys = (
  queryClient: ReturnType<typeof useQueryClient>,
  keys: QueryKey[],
): Promise<void[]> => {
  return Promise.all(keys.map(queryKey => queryClient.invalidateQueries({queryKey})));
};
