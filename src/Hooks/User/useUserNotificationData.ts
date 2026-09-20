import {FezType} from '#src/Enums/FezType';
import {FezData, UserNotificationData} from '#src/Structs/ControllerStructs';

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
const totalNewSeamail = (data?: UserNotificationData) => {
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
const isAddedTo = (data: UserNotificationData | undefined, fez: FezData): boolean => {
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

const userNotificationDataFunctions = {totalNewCount, totalNewSeamail, totalNewLFG, totalNewPrivateEvent, isAddedTo};

/**
 * These are pure, parameterized by their arguments — no component state involved — so
 * they're defined at module scope and returned as one stable object. Defining them inside
 * the hook body instead gives every caller a new function identity on every render, which
 * is fatal for any consumer that lists them in a useEffect dependency array: the effect
 * re-fires every render, and if it calls setState (directly or via a mutation like
 * markRead), that's a render loop. `useMarkFezReadEffect` in useFezData.ts does exactly
 * this with `isAddedTo` — see the useAppImage.ts fix for the same pattern.
 */
export const useUserNotificationData = () => userNotificationDataFunctions;
