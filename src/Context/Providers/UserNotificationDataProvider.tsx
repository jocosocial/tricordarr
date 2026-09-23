import React, {PropsWithChildren} from 'react';

import {
  UserNotificationDataContext,
  UserNotificationDataContextType,
} from '#src/Context/Contexts/UserNotificationDataContext';
import {FezType} from '#src/Enums/FezType';
import {FezData, UserNotificationData} from '#src/Structs/ControllerStructs';

/**
 * Coerce a count to a number for summing.
 *
 * The top-level UserNotificationData counts are all declared required now (issue #623), so this is
 * no longer a type-driven guard for those. It stays because these structs are compile-time
 * assertions over raw JSON with no runtime validation: one absent field would otherwise turn the
 * whole sum into NaN and render "NaN" in a tab badge. `moderatorData` is genuinely optional.
 */
const valueOrZero = (value?: number) => value || 0;

const totalNewCount = (data?: UserNotificationData) => {
  if (!data) {
    return 0;
  }
  return (
    valueOrZero(data.newAnnouncementCount) +
    valueOrZero(data.newTwarrtMentionCount) +
    valueOrZero(data.newForumMentionCount) +
    valueOrZero(data.newSeamailMessageCount) +
    valueOrZero(data.newFezMessageCount) +
    valueOrZero(data.newPrivateEventMessageCount) +
    valueOrZero(data.addedToSeamailCount) +
    // We have no way to list "new LFGs/PEs you've been added to" in the API.
    valueOrZero(data.addedToLFGCount) +
    valueOrZero(data.addedToPrivateEventCount) +
    valueOrZero(data.moderatorData?.newModeratorSeamailMessageCount) +
    valueOrZero(data.moderatorData?.newTTSeamailMessageCount) +
    valueOrZero(data.moderatorData?.newModeratorForumMentionCount) +
    valueOrZero(data.moderatorData?.newTTForumMentionCount)
  );
};

/**
 * Unread seamail threads plus chats the user was added to but has not yet viewed.
 * Combined with LFG and private-event chat unreads for the Seamail bottom-tab badge
 * (along with privileged-account counts).
 */
export const totalNewSeamail = (data?: UserNotificationData) => {
  if (!data) {
    return 0;
  }
  return valueOrZero(data.newSeamailMessageCount) + valueOrZero(data.addedToSeamailCount);
};

const totalNewLFG = (data?: UserNotificationData) => {
  if (!data) {
    return 0;
  }
  return valueOrZero(data.newFezMessageCount) + valueOrZero(data.addedToLFGCount);
};

const totalNewPrivateEvent = (data?: UserNotificationData) => {
  if (!data) {
    return 0;
  }
  return valueOrZero(data.newPrivateEventMessageCount) + valueOrZero(data.addedToPrivateEventCount);
};

/**
 * Whether the given fez is one the user's been added to but hasn't yet viewed.
 */
export const isAddedTo = (data: UserNotificationData | undefined, fez: FezData): boolean => {
  if (!data) {
    return false;
  }
  if (FezType.isSeamailType(fez.fezType)) {
    return data.addedToSeamailIDs.includes(fez.fezID);
  }
  if (FezType.isLFGType(fez.fezType)) {
    return data.addedToLFGIDs.includes(fez.fezID);
  }
  if (FezType.isPrivateEventType(fez.fezType)) {
    return data.addedToPrivateEventIDs.includes(fez.fezID);
  }
  return false;
};

const userNotificationDataContextValue: UserNotificationDataContextType = {
  totalNewCount,
  totalNewSeamail,
  totalNewLFG,
  totalNewPrivateEvent,
  isAddedTo,
};

export const UserNotificationDataProvider = ({children}: PropsWithChildren) => {
  return (
    <UserNotificationDataContext.Provider value={userNotificationDataContextValue}>
      {children}
    </UserNotificationDataContext.Provider>
  );
};
