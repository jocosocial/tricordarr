import React, {PropsWithChildren} from 'react';

import {BoardgameDataContext, BoardgameDataContextType} from '#src/Context/Contexts/BoardgameDataContext';
import {BoardgameData} from '#src/Structs/ControllerStructs';

const getPlayers = (boardgame: BoardgameData) => {
  if (boardgame.minPlayers && boardgame.maxPlayers) {
    if (boardgame.minPlayers < boardgame.maxPlayers) {
      return `${boardgame.minPlayers}-${boardgame.maxPlayers} Players`;
    } else {
      return `${boardgame.minPlayers} Players`;
    }
  }
};

const getPlayingTime = (boardgame: BoardgameData) => {
  if (boardgame.minPlayingTime && boardgame.maxPlayingTime) {
    if (boardgame.minPlayingTime < boardgame.maxPlayingTime) {
      return `${boardgame.minPlayingTime}-${boardgame.maxPlayingTime} minutes`;
    } else {
      return `${boardgame.minPlayingTime} minutes`;
    }
  }
};

const boardgameDataContextValue: BoardgameDataContextType = {getPlayers, getPlayingTime};

export const BoardgameDataProvider = ({children}: PropsWithChildren) => {
  return <BoardgameDataContext.Provider value={boardgameDataContextValue}>{children}</BoardgameDataContext.Provider>;
};
