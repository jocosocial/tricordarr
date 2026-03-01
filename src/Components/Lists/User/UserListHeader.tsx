import React from 'react';

import {
  ModeratorBlockText,
  ModeratorMuteText,
  UserBlockText,
  UserFavoriteText,
  UserMuteText,
} from '#src/Components/Text/UserRelationsText';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {type UserRelationMode} from '#src/Queries/Users/UserRelationConstants';

interface UserListHeaderProps {
  mode: UserRelationMode;
  hasModerator: boolean;
}

export const UserListHeader = ({mode, hasModerator}: UserListHeaderProps) => {
  return (
    <PaddedContentView padTop={true}>
      {mode === 'favorite' && <UserFavoriteText />}
      {mode === 'mute' && (
        <>
          <UserMuteText />
          {hasModerator && <ModeratorMuteText />}
        </>
      )}
      {mode === 'block' && (
        <>
          <UserBlockText />
          {hasModerator && <ModeratorBlockText />}
        </>
      )}
    </PaddedContentView>
  );
};
