import * as WebBrowser from 'expo-web-browser';

import {createLogger} from '#src/Libraries/Logger';
import {isAndroid} from '#src/Libraries/Platform/Detection';

const logger = createLogger('Browser.ts');

/**
 * Package of the browser to open Custom Tabs in. Android resolves an untargeted Custom Tab like any
 * other link, so a URL on a host the app claims would come straight back to the app.
 */
const getBrowserPackage = async (): Promise<string | undefined> => {
  if (!isAndroid) {
    return undefined;
  }
  const {preferredBrowserPackage, defaultBrowserPackage, browserPackages} =
    await WebBrowser.getCustomTabsSupportingBrowsersAsync();
  return preferredBrowserPackage ?? defaultBrowserPackage ?? browserPackages[0];
};

/**
 * Open a URL in the system browser's in-app view (Custom Tabs on Android, SFSafariViewController on iOS).
 * Use this for "Open in Browser" actions instead of Linking.openURL, since the OS can send a URL
 * on a host the app claims straight back to the app.
 */
export const openInBrowser = async (url: string): Promise<void> => {
  const browserPackage = await getBrowserPackage();
  logger.debug('Opening in browser', url, browserPackage);
  await WebBrowser.openBrowserAsync(url, {browserPackage});
};
