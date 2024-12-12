import React, {useState, PropsWithChildren, useEffect} from 'react';
import {UserRelationsContext} from '../Contexts/UserRelationsContext';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useUserMutesQuery} from '../../Queries/Users/UserMuteQueries.ts';
import {useUserBlocksQuery} from '../../Queries/Users/UserBlockQueries.ts';
import {useUserFavoritesQuery} from '../../Queries/Users/UserFavoriteQueries.ts';

export const UserRelationsProvider = ({children}: PropsWithChildren) => {
  const [favorites, setFavorites] = useState<UserHeader[]>([]);
  const [mutes, setMutes] = useState<UserHeader[]>([]);
  const [blocks, setBlocks] = useState<UserHeader[]>([]);

  // We don't have a way in the API to determine who is blocked/muted/favorited on a per-user basis.
  // So the only way we can tell the user they've blocked/muted/favorited someone is by comparing
  // to the pre-fetched list. This relies on the cached data until various other screens (such as UserProfileScreen)
  // trigger either the initial load (first time) or background fetch (staleTime). Manual refetch available on
  // the TodayScreen.
  const {data: favoritesData, refetch: refetchFavorites} = useUserFavoritesQuery({enabled: false});
  const {data: mutesData, refetch: refetchMutes} = useUserMutesQuery({enabled: false});
  const {data: blocksData, refetch: refetchBlocks} = useUserBlocksQuery({enabled: false});

  useEffect(() => {
    if (favoritesData) {
      setFavorites(favoritesData);
    }
    if (mutesData) {
      setMutes(mutesData);
    }
    if (blocksData) {
      setBlocks(blocksData);
    }
  }, [blocksData, favoritesData, mutesData]);

  return (
    <UserRelationsContext.Provider
      value={{
        favorites,
        setFavorites,
        mutes,
        setMutes,
        blocks,
        setBlocks,
        refetchFavorites,
        refetchMutes,
        refetchBlocks,
      }}>
      {children}
    </UserRelationsContext.Provider>
  );
};
