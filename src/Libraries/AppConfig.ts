import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

import {ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';
import {defaultCacheTime, defaultImageStaleTime, defaultStaleTime} from '#src/Libraries/Network/APIClient';
import {StorageKeys} from '#src/Libraries/Storage';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

export type PushNotificationConfig = {
  [_key in keyof typeof NotificationTypeData]: boolean;
};

export interface APIClientConfig {
  defaultPageSize: number;
  canonicalHostnames: string[];
  cacheBuster: string;
  cacheTime: number;
  retry: number;
  staleTime: number;
  disruptionThreshold: number;
  requestTimeout: number;
  imageStaleTime: number;
}

export interface ScheduleConfig {
  eventsShowJoinedLfgs: boolean;
  eventsShowOpenLfgs: boolean;
  hidePastLfgs: boolean;
  enableLateDayFlip: boolean;
  defaultLfgScreen: LfgStackComponents;
}

export interface AccessibilityConfig {
  useSystemTheme: boolean;
  darkMode: boolean;
}

/**
 * Some day this should be a part of Swiftarr.
 */
export interface UserPreferences {
  reverseSwipeOrientation: boolean;
  defaultForumSortOrder: ForumSort | undefined;
  defaultForumSortDirection: ForumSortDirection | undefined;
  highlightForumAlertWords: boolean;
  autosavePhotos: boolean;
}

export interface AppConfig {
  serverUrl: string;
  urlPrefix: string;
  enableBackgroundWorker: boolean;
  notificationPollInterval: number;
  enableNotificationPolling: boolean;
  enableNotificationSocket: boolean;
  enableFezSocket: boolean;
  pushNotifications: PushNotificationConfig;
  fgsWorkerHealthTimer: number;
  oobeExpectedVersion: number;
  oobeCompletedVersion: number;
  enableDeveloperOptions: boolean;
  enableExperiments: boolean;
  cruiseStartDate: Date;
  cruiseLength: number;
  schedule: ScheduleConfig;
  portTimeZoneID: string;
  apiClientConfig: APIClientConfig;
  enableEasterEgg: boolean;
  accessibility: AccessibilityConfig;
  muteNotifications?: Date;
  skipThumbnails: boolean;
  schedBaseUrl: string;
  userPreferences: UserPreferences;
  markReadCancelPush: boolean;
  preRegistrationServerUrl: string;
  preRegistrationEndDate: Date;
  manualTimeOffset: number;
}

const defaultAppConfig: AppConfig = {
  serverUrl: '',
  urlPrefix: '/api/v3',
  enableBackgroundWorker: true,
  notificationPollInterval: 120000, // 2 minutes
  enableNotificationPolling: true,
  enableNotificationSocket: true,
  enableFezSocket: true,
  pushNotifications: {
    announcement: true,
    seamailUnreadMsg: true,
    fezUnreadMsg: true,
    alertwordTwarrt: false,
    alertwordPost: true,
    twarrtMention: false,
    forumMention: true,
    followedEventStarting: true,
    joinedLFGStarting: true,
    incomingPhoneCall: true,
    phoneCallAnswered: true,
    phoneCallEnded: true,
    moderatorForumMention: true,
    twitarrTeamForumMention: true,
    personalEventStarting: true,
    addedToSeamail: true,
    addedToLFG: true,
    addedToPrivateEvent: true,
    privateEventUnreadMsg: true,
    microKaraokeSongReady: true,
    privateEventCanceled: true,
    lfgCanceled: true,
  },
  fgsWorkerHealthTimer: 20000, // 20000 == 20 seconds
  oobeCompletedVersion: 0,
  oobeExpectedVersion: 0,
  enableDeveloperOptions: false,
  cruiseStartDate: new Date(2023, 3, 5),
  cruiseLength: 8,
  manualTimeOffset: 60,
  schedule: {
    hidePastLfgs: false,
    enableLateDayFlip: true,
    eventsShowJoinedLfgs: true,
    eventsShowOpenLfgs: false,
    defaultLfgScreen: LfgStackComponents.lfgFindScreen,
  },
  portTimeZoneID: 'America/New_York',
  apiClientConfig: {
    defaultPageSize: 50,
    canonicalHostnames: ['twitarr.com'],
    cacheBuster: new Date().toString(),
    cacheTime: defaultCacheTime,
    retry: 2, // 3 attempts total (initial, retry 1, retry 2)
    staleTime: defaultStaleTime,
    disruptionThreshold: 10,
    requestTimeout: 10000,
    imageStaleTime: defaultImageStaleTime,
  },
  enableEasterEgg: false,
  accessibility: {
    useSystemTheme: true,
    darkMode: false,
  },
  skipThumbnails: true,
  schedBaseUrl: '',
  userPreferences: {
    reverseSwipeOrientation: false,
    defaultForumSortDirection: undefined,
    defaultForumSortOrder: undefined,
    highlightForumAlertWords: true,
    autosavePhotos: true,
  },
  markReadCancelPush: true,
  preRegistrationServerUrl: '',
  preRegistrationEndDate: new Date(2023, 3, 5),
  enableExperiments: false,
};

/**
 * Generates an AppConfig object from the defaults and React Native Config "env vars".
 */
export const getInitialAppConfig = () => {
  let config = defaultAppConfig;
  if (Config.SERVER_URL) {
    config.serverUrl = Config.SERVER_URL;
  }
  if (Config.OOBE_VERSION) {
    config.oobeExpectedVersion = Number(Config.OOBE_VERSION);
  }
  if (Config.CRUISE_START_DATE) {
    const [year, month, day] = Config.CRUISE_START_DATE.split('-').map(Number);
    // Because Javascript, Fools!
    config.cruiseStartDate = new Date(year, month - 1, day);
  }
  if (Config.CRUISE_LENGTH) {
    config.cruiseLength = Number(Config.CRUISE_LENGTH);
  }
  if (Config.PORT_TIME_ZONE_ID) {
    config.portTimeZoneID = Config.PORT_TIME_ZONE_ID;
  }
  if (Config.SCHED_URL) {
    config.schedBaseUrl = Config.SCHED_URL;
  }
  if (Config.PREREGISTRATION_SERVER_URL) {
    config.preRegistrationServerUrl = Config.PREREGISTRATION_SERVER_URL;
  } else {
    config.preRegistrationServerUrl = config.serverUrl;
  }
  if (Config.PREREGISTRATION_END_DATE) {
    const [year, month, day] = Config.PREREGISTRATION_END_DATE.split('-').map(Number);
    // Because Javascript, Fools!
    config.preRegistrationEndDate = new Date(year, month - 1, day, 23, 59, 59);
  }
  return config;
};

/**
 * Returns the current AppConfig, either from storage or generates from default + "env vars".
 */
export const getAppConfig = async () => {
  let rawConfig = await AsyncStorage.getItem(StorageKeys.APP_CONFIG);
  if (!rawConfig) {
    const defaultConfig = getInitialAppConfig();
    await AsyncStorage.setItem(StorageKeys.APP_CONFIG, JSON.stringify(defaultConfig));
    return defaultConfig;
  }
  let appConfig = JSON.parse(rawConfig) as AppConfig;
  // Certain keys should always be loaded from the app environment.
  // I'm becoming less certain about this. Dropped cruise settings because I have screens for that.
  // Avoid putting things from the SwiftarrClientData endpoint in here. It's confusing.
  if (Config.PREREGISTRATION_END_DATE) {
    const [year, month, day] = Config.PREREGISTRATION_END_DATE.split('-').map(Number);
    // Because Javascript, Fools!
    appConfig.preRegistrationEndDate = new Date(year, month - 1, day, 23, 59, 59);
  }
  // Type conversions on a couple of keys. Barf.
  appConfig.cruiseStartDate = new Date(appConfig.cruiseStartDate);
  appConfig.preRegistrationEndDate = new Date(appConfig.preRegistrationEndDate);
  if (appConfig.muteNotifications) {
    appConfig.muteNotifications = new Date(appConfig.muteNotifications);
  }

  // "Migration"
  if (appConfig.manualTimeOffset === undefined) {
    appConfig.manualTimeOffset = 0;
  }

  // Ok now we're done
  return appConfig;
};
