import {Alert} from 'react-native';
import URLParse from 'url-parse';

import {openInBrowser} from '#src/Libraries/Browser';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('LinkAlerts.ts');

/**
 * Explains that a link can't open in the app because it belongs to a server this session isn't
 * using, and offers the browser instead. This is where a "switch session" action would go once the
 * app supports multiple sessions.
 */
export const alertForeignLink = (url: string, serverUrl: string): void => {
  const linkHost = new URLParse(url).hostname;
  const serverHost = new URLParse(serverUrl).hostname;
  Alert.alert(
    'Link for a different server',
    `This link is for ${linkHost}, but the app is connected to ${serverHost}.\n\nYou can open it in a browser, or change servers in Settings.`,
    [
      {text: 'OK', style: 'cancel'},
      {
        text: 'Open in Browser',
        onPress: () => {
          openInBrowser(url).catch(err => logger.error('Failed to open URL in browser:', err));
        },
      },
    ],
  );
};
