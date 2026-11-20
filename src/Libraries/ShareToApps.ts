import Share from 'react-native-share';

import {isAndroid} from '#src/Libraries/Platform/Detection';
import {buildShareMessage} from '#src/Libraries/Sharing';

/**
 * Opens the system share sheet for a link.
 * Android puts the link in message so it is sent as text; iOS uses url so the sheet can preview it.
 * When contentText is present (e.g. a post body), both platforms share it combined with the
 * link as one plaintext message instead, since there's no separate preview to preserve.
 */
export const shareLinkToApps = async (link: string, contentText?: string) => {
  await Share.open({
    ...(contentText ? {message: buildShareMessage(contentText, link)} : isAndroid ? {message: link} : {url: link}),
    failOnCancel: false,
  });
};
