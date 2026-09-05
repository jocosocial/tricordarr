import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Libraries/Sharing';

interface FezPublicShare {
  contentType: ShareContentType;
  contentID: string;
  contentIcon: string;
}

/**
 * Public share target for a fez: LFG, seamail, personal event, or private-event chat.
 */
export const getFezPublicShare = (fezType: FezType, fezID: string): FezPublicShare => {
  if (FezType.isLFGType(fezType)) {
    return {contentType: ShareContentType.lfg, contentID: fezID, contentIcon: AppIcons.lfg};
  }
  if (FezType.isSeamailType(fezType)) {
    return {contentType: ShareContentType.seamail, contentID: fezID, contentIcon: AppIcons.seamail};
  }
  if (fezType === FezType.privateEvent) {
    return {
      contentType: ShareContentType.personalEvent,
      contentID: `${fezID}/chat`,
      contentIcon: AppIcons.personalEvent,
    };
  }
  return {contentType: ShareContentType.personalEvent, contentID: fezID, contentIcon: AppIcons.personalEvent};
};
