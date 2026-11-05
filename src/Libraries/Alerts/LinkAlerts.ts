import {Alert} from 'react-native';
import URLParse from 'url-parse';

/**
 * Explains that a link can't open because it belongs to a server this session isn't using.
 * This is where a "switch session" action would go once the app supports multiple sessions.
 */
export const alertForeignLink = (url: string, serverUrl: string): void => {
  const linkHost = new URLParse(url).hostname;
  const serverHost = new URLParse(serverUrl).hostname;
  Alert.alert(
    'Link for a different server',
    `This link is for ${linkHost}, but the app is connected to ${serverHost}.\n\nTo open it, change servers in Settings.`,
  );
};
