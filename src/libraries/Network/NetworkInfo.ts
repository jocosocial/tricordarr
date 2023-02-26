import NetInfo, {NetInfoStateType} from '@react-native-community/netinfo';

// Will return undefined if permissions have been added since app
// was started and the cache has not been refreshed. Could call Netinfo.refresh()
// in here, but I'm worried that might be excessive.
export async function getCurrentSSID() {
  let state = await NetInfo.fetch();
  if (state.type === NetInfoStateType.wifi && state.isConnected) {
    try {
      return state.details.ssid;
    } catch (e) {
      console.error('Error getting SSID:', e);
    }
  } else {
    console.log('We are NOT on WiFi.');
  }
}
