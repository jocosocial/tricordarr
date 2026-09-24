import {StackScreenProps} from '@react-navigation/stack';
import pluralize from 'pluralize';
import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {MaintenanceModeScreen} from '#src/Screens/Checkpoint/MaintenanceModeScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {LfgCreateScreenBase} from '#src/Screens/LFG/LfgCreateScreenBase';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.boardgameCreateLfgScreen>;

/**
 * Pure write action (creates an LFG under the current user), so this stays behind
 * LoggedInScreen even though the rest of Boardgames is viewable while logged out.
 */
export const BoardgameCreateLfgScreen = (props: Props) => {
  return (
    <MaintenanceModeScreen>
      <LoggedInScreen>
        <PreRegistrationScreen helpScreen={CommonStackComponents.boardgameHelpScreen}>
          <DisabledFeatureScreen
            feature={SwiftarrFeature.gameslist}
            urlPath={`/boardgames/${props.route.params.boardgame.gameID}/createfez`}>
            <BoardgameCreateLfgScreenInner {...props} />
          </DisabledFeatureScreen>
        </PreRegistrationScreen>
      </LoggedInScreen>
    </MaintenanceModeScreen>
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
