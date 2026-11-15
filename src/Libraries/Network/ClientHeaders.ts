import DeviceInfo from 'react-native-device-info';

/**
 * Headers every request to a Swiftarr server sends, API or not: the client identity and no HTTP
 * caching.
 */
export const getClientIdentityHeaders = () => ({
  'X-Swiftarr-Client': `${DeviceInfo.getApplicationName()} ${DeviceInfo.getVersion()}`,
  // https://www.reddit.com/r/reactnative/comments/15frmyb/is_axios_caching/
  'Cache-Control': 'no-store',
});

/**
 * Headers every Swiftarr API request sends regardless of who is signed in: JSON responses plus the
 * client identity.
 */
export const getApiClientHeaders = () => ({
  Accept: 'application/json',
  ...getClientIdentityHeaders(),
});
