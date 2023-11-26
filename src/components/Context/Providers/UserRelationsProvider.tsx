import React, {useState, PropsWithChildren, useEffect} from 'react';
import {UserRelationsContext} from '../Contexts/UserRelationsContext';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useUserMutesQuery} from '../../Queries/Users/UserMuteQueries';
import {useUserBlocksQuery} from '../../Queries/Users/UserBlockQueries';
import {useUserFavoritesQuery} from '../../Queries/Users/UserFavoriteQueries';

export const UserRelationsProvider = ({children}: PropsWithChildren) => {
  const [favorites, setFavorites] = useState<UserHeader[]>([]);
  const [mutes, setMutes] = useState<UserHeader[]>([]);
  const [blocks, setBlocks] = useState<UserHeader[]>([]);

  // We don't have a way in the API to determine who is blocked/muted/favorited on a per-user basis.
  // So the only way we can tell the user they've blocked/muted/favorited someone is by comparing
  // to the pre-fetched list, fetched here. It probably doesn't update much beyond what the user does
  // within the app, so it should be OK for now. Besides it doesn't impact what content the user
  // receives via the various APIs. That is done at the API layer.
  const {data: favoritesData, refetch: refetchFavorites} = useUserFavoritesQuery();
  const {data: mutesData, refetch: refetchMutes} = useUserMutesQuery();
  const {data: blocksData, refetch: refetchBlocks} = useUserBlocksQuery();

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
