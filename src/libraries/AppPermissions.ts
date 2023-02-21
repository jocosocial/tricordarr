import {check as checkPermission, request as requestPermission, RESULTS, PERMISSIONS} from 'react-native-permissions';

export class AppPermissions {
  permission: any;
  title: string;
  description: string;

  static NOTIFICATIONS = new AppPermissions(
    PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
    'Notifications',
    'Show Twitarr notifications on this device.',
  );

  static LOCATION = new AppPermissions(
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    'Location',
    "Determine if you're on the boat by looking at the WiFi network. Helps conserve battery.",
  );

  constructor(permission: any, title: string, description: string) {
    this.permission = permission;
    this.title = title;
    this.description = description;
  }

  // https://github.com/zoontek/react-native-permissions
  async check() {
    const result = await checkPermission(this.permission);
    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('This feature is not available (on this device / in this context)');
        break;
      case RESULTS.DENIED:
        console.log('The permission has not been requested / is denied but requestable');
        break;
      case RESULTS.LIMITED:
        console.log('The permission is limited: some actions are possible');
        break;
      case RESULTS.GRANTED:
        console.log('The permission is granted');
        break;
      case RESULTS.BLOCKED:
        console.log('The permission is denied and not requestable anymore');
        break;
    }
    return result;
  }

  // This is a no-op if the permission is already granted.
  async request() {
    return await requestPermission(this.permission);
  }
}
