/**
 * Lifted from https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Enumerations/Dinnerteam.swift
 * These have to stay lower-case in the values since those are what get POST'd to the server.
 */
export enum DinnerTeam {
  red = 'red',
  gold = 'gold',
  sro = 'sro',
}

export namespace DinnerTeam {
  export const getLabel = (team?: DinnerTeam) => {
    switch (team) {
      case DinnerTeam.red:
        return 'Red Team';
      case DinnerTeam.gold:
        return 'Gold Team';
      case DinnerTeam.sro:
        return 'Club SRO';
      default:
        return 'None';
    }
  };
}
