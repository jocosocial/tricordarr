import {createContext, useContext} from 'react';

import {BoardgameData} from '#src/Structs/ControllerStructs';

export interface BoardgameDataContextType {
  getPlayers: (boardgame: BoardgameData) => string | undefined;
  getPlayingTime: (boardgame: BoardgameData) => string | undefined;
}

export const BoardgameDataContext = createContext(<BoardgameDataContextType>{});

/**
 * Pure display-formatting helpers for BoardgameData. Provided as a context (rather than
 * a plain hook) so consumers get stable function references across renders - see
 * AppImageContext.ts for the full rationale.
 */
export const useBoardgameData = () => useContext(BoardgameDataContext);
