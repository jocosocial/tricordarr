import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';
import {BoardgameRecommendationData, BoardgameResponseData} from '../../../libraries/Structs/ControllerStructs.tsx';

interface BoardgameFavoriteMutationProps {
  boardgameID: string;
  action: 'favorite' | 'unfavorite';
}

export const useBoardgameFavoriteMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({boardgameID, action}: BoardgameFavoriteMutationProps) => {
    // We don't do the same [/favorite, /unfavorite] endpoints like we do for users.
    const endpoint = action === 'favorite' ? 'favorite' : 'favorite/remove';
    return await apiPost(`/boardgames/${boardgameID}/${endpoint}`);
  };

  return useTokenAuthMutation(queryHandler);
};

export const useBoardgameRecommendMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({recommendationData}: {recommendationData: BoardgameRecommendationData}) => {
    return await apiPost<BoardgameResponseData, BoardgameRecommendationData>(
      '/boardgames/recommend',
      recommendationData,
    );
  };

  return useTokenAuthMutation(queryHandler);
};
