import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {QuartermasterData} from '#src/Structs/ControllerStructs';

/**
 * Who is looking at a Quartermastarr item.
 */
export interface QuartermasterViewer {
  /** The current user's ID, if known. */
  userID?: string | null;
  hasModerator: boolean;
  hasVerified: boolean;
}

/**
 * Whether the viewer owns the item. Swiftarr always includes `owner` for the item's own
 * author, even when the name is hidden from everyone else, so a missing `owner` is never "mine".
 */
export const isOwnQuartermasterItem = (item: QuartermasterData, viewer: QuartermasterViewer): boolean => {
  return isQuartermasterItemOwner(item, viewer.userID);
};

/**
 * Whether the user with this ID owns the item. For callers, such as the cache reducer, that
 * know a user ID but not the viewer's roles.
 */
export const isQuartermasterItemOwner = (item: QuartermasterData, userID?: string | null): boolean => {
  return !!userID && item.owner?.userID === userID;
};

/**
 * Whether the item is in a state moderators have restricted. Quarantined items arrive with
 * masked text and no photo, and locked items can't be changed by their owner, so none of them
 * are worth opening or acting on for ordinary users.
 */
export const isRestrictedQuartermasterItem = (item: QuartermasterData): boolean => {
  return (
    item.moderationStatus === ContentModerationStatus.quarantined ||
    item.moderationStatus === ContentModerationStatus.autoQuarantined ||
    item.moderationStatus === ContentModerationStatus.locked
  );
};

/**
 * Whether a moderator has hidden the item's contents. The server sends quarantined items with
 * masked text and no photo; locked items keep their real contents.
 */
export const isQuarantinedQuartermasterItem = (item: QuartermasterData): boolean => {
  return (
    item.moderationStatus === ContentModerationStatus.quarantined ||
    item.moderationStatus === ContentModerationStatus.autoQuarantined
  );
};

/**
 * Whether the viewer may open the item's detail screen or act on it from the list.
 * Quarantined items have nothing but masked text, so only moderators can open them. Locked items
 * keep their real contents and can be opened by anyone; locking only stops the owner changing them
 * (see `canModifyQuartermasterItem`).
 */
export const canInteractWithQuartermasterItem = (item: QuartermasterData, viewer: QuartermasterViewer): boolean => {
  return viewer.hasModerator || !isQuarantinedQuartermasterItem(item);
};

/**
 * Whether the viewer may edit or delete the item. Mirrors swiftarr's `guardCanModifyContent`:
 * moderators always can; an owner can only while verified and the item is normal or reviewed.
 */
export const canModifyQuartermasterItem = (item: QuartermasterData, viewer: QuartermasterViewer): boolean => {
  if (viewer.hasModerator) {
    return true;
  }
  return (
    viewer.hasVerified &&
    isOwnQuartermasterItem(item, viewer) &&
    (item.moderationStatus === ContentModerationStatus.normal ||
      item.moderationStatus === ContentModerationStatus.modReviewed)
  );
};

/**
 * Whether the viewer can start a Seamail with the item's owner: the owner must be visible
 * and not be the viewer.
 */
export const canMessageQuartermasterOwner = (item: QuartermasterData, viewer: QuartermasterViewer): boolean => {
  return !!item.owner && !isOwnQuartermasterItem(item, viewer);
};

/**
 * The subject swiftarr's site prefills when messaging an item's owner.
 */
export const getQuartermasterSeamailSubject = (item: QuartermasterData): string => {
  return `Re: Quartermastarr Item - ${item.itemName}`;
};
