import {BoardgameData} from '#src/Structs/ControllerStructs';

export const useBoardgameData = () => {
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

  return {getPlayers, getPlayingTime};
};
