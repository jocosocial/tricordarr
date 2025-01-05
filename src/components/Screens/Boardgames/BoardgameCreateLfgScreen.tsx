import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {LfgCreateScreenBase} from '../LFG/LfgCreateScreenBase.tsx';
import pluralize from 'pluralize';
import {FezType} from '../../../libraries/Enums/FezType.ts';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.boardgameCreateLfgScreen>;

export const BoardgameCreateLfgScreen = ({route}: Props) => {
  const description = `Play a board game! We'll be playing "${
    route.params.boardgame.gameName
  }".\n\nRemember, LFG is not a game reservation service. The game library has ${
    route.params.boardgame.numCopies
  } ${pluralize('copy', route.params.boardgame.numCopies)} of this game.`;
  return (
    <LfgCreateScreenBase
      title={`Play ${route.params.boardgame.gameName}`}
      info={description}
      fezType={FezType.gaming}
      location={'Dining Room, Deck 3 Aft'}
      duration={route.params.boardgame.avgPlayingTime}
      minCapacity={route.params.boardgame.minPlayers}
      maxCapacity={route.params.boardgame.maxPlayers}
    />
  );
};
