import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';

import {ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';
import {LogLevel} from '#src/Libraries/Logger/types';
import {defaultCacheTime, defaultImageStaleTime, defaultStaleTime} from '#src/Libraries/Network/APIClient';
import {StorageKeys} from '#src/Libraries/Storage';
import {NotificationTypeData} from '#src/Structs/SocketStructs';
import {FezListEndpoints} from '#src/Types';

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
  defaultLfgList: FezListEndpoints;
  overlapExcludeDurationHours: number;
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
  showScrollButton: boolean;
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
  enableDeveloperOptions: boolean;
  enableExperiments: boolean;
  cruiseStartDateStr: string;
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
  manualTimeOffset: number;
  wifiNetworkNames: string[];
  forceShowTimezoneWarning: boolean;
  silenceTimezoneWarnings: boolean;
  logLevel: LogLevel;
}

export const defaultAppConfig: AppConfig = {
  serverUrl: __DEV__ ? 'https://beta.twitarr.com' : 'https://twitarr.com',
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
  oobeExpectedVersion: 3,
  enableDeveloperOptions: false,
  cruiseStartDateStr: '2023-04-05',
  cruiseStartDate: new Date(2023, 3, 5),
  cruiseLength: 8,
  manualTimeOffset: 0,
  schedule: {
    hidePastLfgs: false,
    enableLateDayFlip: true,
    eventsShowJoinedLfgs: true,
    eventsShowOpenLfgs: false,
    defaultLfgList: 'open',
    overlapExcludeDurationHours: 4,
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
    showScrollButton: true,
    defaultForumSortDirection: undefined,
    defaultForumSortOrder: undefined,
    highlightForumAlertWords: true,
    autosavePhotos: true,
  },
  markReadCancelPush: true,
  preRegistrationServerUrl: 'https://start.twitarr.com',
  enableExperiments: false,
  wifiNetworkNames: [],
  forceShowTimezoneWarning: false,
  silenceTimezoneWarnings: false,
  // logLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
  logLevel: LogLevel.DEBUG,
};

/**
 * Returns the current AppConfig, either from storage or generates from default + "env vars".
 */
export const getAppConfig = async () => {
  let rawConfig = await AsyncStorage.getItem(StorageKeys.APP_CONFIG);
  if (!rawConfig) {
    return defaultAppConfig;
  }
  let appConfig = JSON.parse(rawConfig) as AppConfig;
  // Reconstruct cruiseStartDate as midnight in the port timezone.
  // Prefer cruiseStartDateStr (timezone-safe) with fallback for old stored configs.
  if (appConfig.cruiseStartDateStr) {
    appConfig.cruiseStartDate = moment
      .tz(appConfig.cruiseStartDateStr, 'YYYY-MM-DD', appConfig.portTimeZoneID)
      .toDate();
  } else {
    // Backward compat: extract UTC date from legacy stored ISO string
    const raw = new Date(appConfig.cruiseStartDate as unknown as string);
    const y = raw.getUTCFullYear();
    const m = String(raw.getUTCMonth() + 1).padStart(2, '0');
    const d = String(raw.getUTCDate()).padStart(2, '0');
    appConfig.cruiseStartDateStr = `${y}-${m}-${d}`;
    appConfig.cruiseStartDate = moment
      .tz(appConfig.cruiseStartDateStr, 'YYYY-MM-DD', appConfig.portTimeZoneID)
      .toDate();
  }
  if (appConfig.muteNotifications) {
    appConfig.muteNotifications = new Date(appConfig.muteNotifications);
  }

  // "Migration"
  if (appConfig.manualTimeOffset === undefined) {
    appConfig.manualTimeOffset = 0;
  }
  if (appConfig.schedule.overlapExcludeDurationHours === undefined) {
    appConfig.schedule.overlapExcludeDurationHours = 4;
  }
  if (appConfig.logLevel === undefined) {
    appConfig.logLevel = LogLevel.DEBUG;
  }
  if (appConfig.silenceTimezoneWarnings === undefined) {
    appConfig.silenceTimezoneWarnings = false;
  }
  if (appConfig.userPreferences.showScrollButton === undefined) {
    appConfig.userPreferences.showScrollButton = true;
  }

  // Ok now we're done
  return appConfig;
};
