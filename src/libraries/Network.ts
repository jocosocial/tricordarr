import NetInfo, {NetInfoStateType} from '@react-native-community/netinfo';

export function doNetworkInfo() {
  console.log('called doNetworkInfo');
  NetInfo.addEventListener(networkState => {
    console.log('Connection type - ', networkState.type);
    console.log('Is connected? - ', networkState.isConnected);
    console.log(networkState.details);
  });
}

export async function getCurrentSSID() {
  let state = await NetInfo.fetch();
  if (state.type === NetInfoStateType.wifi && state.isConnected) {
    console.log('We are on WiFi.');
    try {
      return state.details.ssid;
    } catch (e) {
      console.error('Error getting SSID:', e);
    }
  }
}
