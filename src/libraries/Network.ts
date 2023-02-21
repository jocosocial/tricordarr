import NetInfo, {NetInfoStateType} from '@react-native-community/netinfo';

// export function doNetworkInfo() {
//   console.log('called doNetworkInfo');
//   const subscription = NetInfo.addEventListener(networkState => {
//     console.log('Connection type - ', networkState.type);
//     console.log('Is connected? - ', networkState.isConnected);
//     console.log(networkState.details);
//   });
//   console.log('WAAAAAAAAAAAAAAAA');
//   console.log(subscription);
// }

// Will return undefined if permissions have been added since app
// was started and doNetworkInfo() above has been called. Should do something about that.
export async function getCurrentSSID() {
  let state = await NetInfo.fetch();
  if (state.type === NetInfoStateType.wifi && state.isConnected) {
    console.log('We are on WiFi.');
    try {
      console.log(state.details);
      return state.details.ssid;
    } catch (e) {
      console.error('Error getting SSID:', e);
    }
  } else {
    console.log('We are NOT on WiFi.');
  }
}
