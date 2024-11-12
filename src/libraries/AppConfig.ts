import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from './Storage';
import {NotificationTypeData} from './Structs/SocketStructs';
import {LfgStackComponents} from './Enums/Navigation';
import {defaultCacheTime, defaultStaleTime} from './Network/APIClient';
import {ForumSort, ForumSortDirection} from './Enums/ForumSortFilter.ts';

export type PushNotificationConfig = {
  [key in keyof typeof NotificationTypeData]: boolean;
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
}

const defaultAppConfig: AppConfig = {
  serverUrl: 'http://joco.hollandamerica.com', // This uses the deprecated URL so we can be sure its overridden later.
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
  },
  fgsWorkerHealthTimer: 20000, // 20000 == 20 seconds
  oobeCompletedVersion: 0,
  oobeExpectedVersion: 0,
  enableDeveloperOptions: false,
  cruiseStartDate: new Date(2023, 3, 5),
  cruiseLength: 8,
  schedule: {
    hidePastLfgs: true,
    enableLateDayFlip: true,
    eventsShowJoinedLfgs: true,
    eventsShowOpenLfgs: false,
    defaultLfgScreen: LfgStackComponents.lfgFindScreen,
  },
  portTimeZoneID: 'America/New_York',
  apiClientConfig: {
    defaultPageSize: 50,
    canonicalHostnames: ['joco.hollandamerica.com', 'twitarr.com'],
    cacheBuster: new Date().toString(),
    cacheTime: defaultCacheTime,
    retry: 2, // 3 attempts total (initial, retry 1, retry 2)
    staleTime: defaultStaleTime,
    disruptionThreshold: 10,
    requestTimeout: 10000,
  },
  enableEasterEgg: false,
  accessibility: {
    useSystemTheme: true,
    darkMode: false,
  },
  skipThumbnails: true,
  schedBaseUrl: 'https://jococruise1970.sched.com',
  userPreferences: {
    reverseSwipeOrientation: false,
    defaultForumSortDirection: undefined,
    defaultForumSortOrder: undefined,
  },
  markReadCancelPush: true,
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
  if (Config.OOBE_VERSION) {
    appConfig.oobeExpectedVersion = Number(Config.OOBE_VERSION);
  }
  // Type conversions on a couple of keys. Barf.
  appConfig.cruiseStartDate = new Date(appConfig.cruiseStartDate);
  if (appConfig.muteNotifications) {
    appConfig.muteNotifications = new Date(appConfig.muteNotifications);
  }

  // Ok now we're done
  return appConfig;
};
