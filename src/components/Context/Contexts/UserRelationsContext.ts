import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';

interface UserRelationsContextType {
  favorites: UserHeader[];
  setFavorites: Dispatch<SetStateAction<UserHeader[]>>;
  mutes: UserHeader[];
  setMutes: Dispatch<SetStateAction<UserHeader[]>>;
  blocks: UserHeader[];
  setBlocks: Dispatch<SetStateAction<UserHeader[]>>;
  refetchFavorites: () => void;
  refetchMutes: () => void;
  refetchBlocks: () => void;
}

export const UserRelationsContext = createContext(<UserRelationsContextType>{});

export const useUserRelations = () => useContext(UserRelationsContext);
