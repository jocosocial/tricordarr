import {StackScreenProps} from '@react-navigation/stack';
import pluralize from 'pluralize';
import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {LfgCreateScreenBase} from '#src/Screens/LFG/LfgCreateScreenBase';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.boardgameCreateLfgScreen>;

export const BoardgameCreateLfgScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.gameslist}
        urlPath={`/boardgames/${props.route.params.boardgame.gameID}/createfez`}>
        <BoardgameCreateLfgScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const BoardgameCreateLfgScreenInner = ({route}: Props) => {
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
