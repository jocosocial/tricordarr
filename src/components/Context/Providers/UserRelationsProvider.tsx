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
