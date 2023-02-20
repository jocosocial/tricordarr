import NetInfo, {NetInfoStateType} from '@react-native-community/netinfo';

export function doNetworkInfo() {
  console.log('called doNetworkInfo');
  NetInfo.addEventListener(networkState => {
    console.log('Connection type - ', networkState.type);
    console.log('Is connected? - ', networkState.isConnected);
    console.log(networkState.details);
  });
}

export function getCurrentSSID() {
  NetInfo.fetch().then(state => {
    if (state.type === NetInfoStateType.wifi && state.isConnected) {
      console.log('yooooo');
      try {
        console.log('derp?', state.details.ssid);
        return state.details.ssid;
      } catch (e) {
        console.error('Error getting SSID:', e);
      }
    }
    console.log('grr argggggg');
    // console.log('Is connected?', state.isConnected);
  });
}
