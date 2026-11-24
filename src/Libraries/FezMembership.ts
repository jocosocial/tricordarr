import {FezData} from '#src/Structs/ControllerStructs';

/**
 * True if the user is actually a participant or on the waiting list of the fez. `fez.members` alone
 * is not enough: Swiftarr also populates it for moderators on LFGs they have not joined.
 */
export const isUserInFez = (fez: FezData, userID?: string | null): boolean => {
  if (!fez.members || !userID) {
    return false;
  }
  return (
    fez.members.participants.some(p => p.userID === userID) || fez.members.waitingList.some(p => p.userID === userID)
  );
};
