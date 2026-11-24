import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';

import {ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';
import {ScheduleOverlapViewMode} from '#src/Enums/ScheduleOverlapViewMode';
import {ShipCode} from '#src/Enums/ShipCode';
import {TimeZoneLabelMode} from '#src/Enums/TimeZoneLabelMode';
import {LogLevel} from '#src/Libraries/Logger/types';
import {StorageKeys} from '#src/Libraries/Storage';
import type {ServerProfile} from '#src/Structs/SessionStructs';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

export type PushNotificationConfig = {
  [_key in `${NotificationTypeData}`]: boolean;
};

export interface APIClientConfig {
  defaultPageSize: number;
  cacheBuster: string;
  cacheTime: number;
  retry: number;
  staleTime: number;
  disruptionThreshold: number;
  requestTimeout: number;
  /**
   * Timeout for write requests (POST/DELETE). Deliberately longer than requestTimeout: a write
   * that times out client-side may still have succeeded server-side, and the user retrying it is
   * exactly how duplicate posts happen on the ship network. See #533.
   */
  mutationTimeout: number;
  imageStaleTime: number;
  /**
   * How long (ms) to suppress the generic error Snackbar after a server URL switch begins,
   * to give the maintenance-mode check a chance to resolve before other mounted queries'
   * transient 401s surface as scary errors. Cleared earlier once the swap settles; this is
   * just the fallback ceiling.
   */
  serverSwitchGracePeriod: number;
}

export interface ScheduleConfig {
  eventsShowJoinedLfgs: boolean;
  eventsShowOpenLfgs: boolean;
  hidePastLfgs: boolean;
  enableLateDayFlip: boolean;
  overlapExcludeDurationHours: number;
  overlapViewMode: ScheduleOverlapViewMode;
  overlapOnlyYourEvents: boolean;
  compactThemeEvents: boolean;
  /** Day Planner style timelines open with Expand on. The header button still toggles it per visit. */
  expandTimelinesByDefault: boolean;
  timeZoneLabelMode: TimeZoneLabelMode;
  showMarkersOutsideCruiseWeek: boolean;
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
  autoCompressOversizedImages: boolean;
  /** Show a post's images as one compact gallery rather than stacked. */
  imageGalleryView: boolean;
  shareOpensSheet: boolean;
  seamailIncludeLfgs: boolean;
  seamailIncludePrivateEvents: boolean;
}

/**
 * Settings that belong to one account rather than to the device. A new account starts from
 * DeviceConfig.defaultPreferences; with no account signed in the defaults are edited in place.
 * Stored per account in AsyncStorage as ACCOUNT_PREFS_V1_<accountID>.
 */
export interface AccountPreferences {
  pushNotifications: PushNotificationConfig;
  muteNotifications?: Date;
  markReadCancelPush: boolean;
  userPreferences: UserPreferences;
  // enableLateDayFlip is app-wide, so it lives on DeviceConfig instead.
  schedule: Omit<ScheduleConfig, 'enableLateDayFlip'>;
  dismissWelcomeAboard: boolean;
  /**
   * Whether this account gets a background socket while it is not the active one. See
   * selectPushAccounts.
   */
  backgroundNotifications: boolean;
}

/**
 * The per-server slice of the effective config. Persisted as a ServerProfile (SessionStructs.ts),
 * which keeps cruiseStartDateStr and derives cruiseStartDate from it.
 */
export interface ServerConfigFields {
  cruiseStartDateStr: string;
  cruiseStartDate: Date;
  cruiseLength: number;
  portTimeZoneID: string;
  schedBaseUrl: string;
  // Which ship's deck maps to fetch from /public/ship/<code>/. Hardcoded client-side
  // for now; should eventually come from the server via /client/settings.
  shipCode: ShipCode;
  wifiNetworkNames: string[];
  dismissMinAccessWarning: boolean;
  // Hostnames the server says are also it (e.g. twitarr.com), from /client/settings. Links to
  // them are routed in-app.
  canonicalHostnames: string[];
}

/**
 * The effective ("merged") config that `useConfig()` consumers read: DeviceConfig, plus the active
 * ServerProfile, plus the active AccountPreferences. Never stored as such. See splitAppConfig
 * and mergeAppConfig.
 */
export interface AppConfig extends ServerConfigFields {
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
  schedule: ScheduleConfig;
  apiClientConfig: APIClientConfig;
  enableEasterEgg: boolean;
  accessibility: AccessibilityConfig;
  muteNotifications?: Date;
  skipThumbnails: boolean;
  imagePreloadDelaySeconds: number;
  userPreferences: UserPreferences;
  markReadCancelPush: boolean;
  preRegistrationServerUrl: string;
  manualTimeOffset: number;
  forceShowTimezoneWarning: boolean;
  silenceTimezoneWarnings: boolean;
  /**
   * Device-wide. Epoch milliseconds until which the time zone warnings are hidden ("dismiss for today").
   * Stored as a number so the JSON-persisted config needs no revival. Undefined means not snoozed.
   */
  timezoneWarningSnoozeUntil?: number;
  dismissWelcomeAboard: boolean;
  backgroundNotifications: boolean;
  /**
   * Device-wide. Whether the Android worker may restart itself on boot or app update after an
   * account's cruise is over. Off by default so phones do not keep launching it forever. Opening
   * the app still starts the worker either way. See selectPushAccounts.
   */
  keepRunningAfterCruise: boolean;
  logLevel: LogLevel;
}

// Live here (rather than APIClient.ts) so AppConfig.ts doesn't import APIClient.ts, which
// would create a require cycle: Logger -> AppConfig -> APIClient -> QueryCacheStorage -> Logger.
export const defaultCacheTime = 1000 * 60 * 60 * 24 * 30; // 30 days
export const defaultStaleTime = 1000 * 60; // 60 seconds
export const defaultImageStaleTime = 1000 * 60 * 60 * 24 * 30; // 30 days

export const defaultAppConfig: AppConfig = {
  serverUrl: __DEV__ ? 'https://beta.twitarr.com' : 'https://twitarr.com',
  urlPrefix: '/api/v3',
  enableBackgroundWorker: true,
  notificationPollInterval: 120000, // 2 minutes
  enableNotificationPolling: true,
  enableNotificationSocket: true,
  enableFezSocket: true,
  // Every type is on by default except deprecated ones.
  pushNotifications: Object.fromEntries(
    Object.entries(NotificationTypeData.specs).map(([type, spec]) => [type, !spec.deprecated]),
  ) as PushNotificationConfig,
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
    overlapExcludeDurationHours: 4,
    overlapViewMode: ScheduleOverlapViewMode.timeline,
    overlapOnlyYourEvents: true,
    compactThemeEvents: true,
    expandTimelinesByDefault: false,
    timeZoneLabelMode: TimeZoneLabelMode.offset,
    showMarkersOutsideCruiseWeek: false,
  },
  portTimeZoneID: 'America/New_York',
  canonicalHostnames: ['twitarr.com'],
  apiClientConfig: {
    defaultPageSize: 50,
    cacheBuster: new Date().toString(),
    cacheTime: defaultCacheTime,
    retry: 2, // 3 attempts total (initial, retry 1, retry 2)
    staleTime: defaultStaleTime,
    disruptionThreshold: 10,
    requestTimeout: 10000,
    mutationTimeout: 30000,
    imageStaleTime: defaultImageStaleTime,
    serverSwitchGracePeriod: 10000,
  },
  enableEasterEgg: false,
  accessibility: {
    useSystemTheme: true,
    darkMode: false,
  },
  skipThumbnails: true,
  imagePreloadDelaySeconds: 2,
  schedBaseUrl: '',
  shipCode: ShipCode.halEd,
  userPreferences: {
    reverseSwipeOrientation: false,
    showScrollButton: true,
    defaultForumSortDirection: undefined,
    defaultForumSortOrder: undefined,
    highlightForumAlertWords: true,
    autosavePhotos: true,
    autoCompressOversizedImages: true,
    imageGalleryView: true,
    shareOpensSheet: false,
    seamailIncludeLfgs: true,
    seamailIncludePrivateEvents: true,
  },
  markReadCancelPush: true,
  preRegistrationServerUrl: 'https://start.twitarr.com',
  enableExperiments: false,
  wifiNetworkNames: [],
  forceShowTimezoneWarning: false,
  silenceTimezoneWarnings: false,
  dismissWelcomeAboard: false,
  dismissMinAccessWarning: false,
  backgroundNotifications: true,
  keepRunningAfterCruise: false,
  // logLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
  logLevel: LogLevel.DEBUG,
};

/**
 * The device-wide slice of the config, persisted as APP_CONFIG_V3. Everything in AppConfig that is
 * not per-server (ServerConfigFields) or per-account (AccountPreferences), plus the defaults a new
 * account's preferences start from. `serverUrl` here only means "default server for a new session".
 */
export type DeviceConfig = Omit<AppConfig, keyof ServerConfigFields | keyof AccountPreferences> & {
  enableLateDayFlip: boolean;
  defaultPreferences: AccountPreferences;
};

/**
 * Pull the account-scoped preferences out of an effective config.
 */
export const pickAccountPreferences = (config: AppConfig): AccountPreferences => {
  const {enableLateDayFlip: _enableLateDayFlip, ...schedule} = config.schedule;
  return {
    pushNotifications: config.pushNotifications,
    muteNotifications: config.muteNotifications,
    markReadCancelPush: config.markReadCancelPush,
    userPreferences: config.userPreferences,
    schedule,
    dismissWelcomeAboard: config.dismissWelcomeAboard,
    backgroundNotifications: config.backgroundNotifications,
  };
};

/**
 * The fields of an effective config that persist in a ServerProfile.
 */
export type ServerProfileFields = Required<
  Pick<
    ServerProfile,
    | 'cruiseStartDateStr'
    | 'cruiseLength'
    | 'portTimeZoneID'
    | 'schedBaseUrl'
    | 'shipCode'
    | 'wifiNetworkNames'
    | 'dismissMinAccessWarning'
    | 'canonicalHostnames'
  >
>;

/**
 * Pull the per-server fields out of an effective config.
 */
export const pickServerProfileFields = (config: ServerConfigFields): ServerProfileFields => ({
  cruiseStartDateStr: config.cruiseStartDateStr,
  cruiseLength: config.cruiseLength,
  portTimeZoneID: config.portTimeZoneID,
  schedBaseUrl: config.schedBaseUrl,
  shipCode: config.shipCode,
  wifiNetworkNames: config.wifiNetworkNames,
  dismissMinAccessWarning: config.dismissMinAccessWarning,
  canonicalHostnames: config.canonicalHostnames,
});

export const defaultAccountPreferences: AccountPreferences = pickAccountPreferences(defaultAppConfig);

export const defaultServerProfileFields: ServerProfileFields = pickServerProfileFields(defaultAppConfig);

/**
 * Split an effective config into its device, account and server parts.
 */
export const splitAppConfig = (
  config: AppConfig,
): {device: DeviceConfig; preferences: AccountPreferences; server: ServerProfileFields} => {
  const preferences = pickAccountPreferences(config);
  const {
    cruiseStartDateStr: _a,
    cruiseStartDate: _b,
    cruiseLength: _c,
    portTimeZoneID: _d,
    schedBaseUrl: _e,
    shipCode: _f,
    wifiNetworkNames: _g,
    dismissMinAccessWarning: _h,
    canonicalHostnames: _p,
    pushNotifications: _i,
    muteNotifications: _j,
    markReadCancelPush: _k,
    userPreferences: _l,
    schedule: _m,
    dismissWelcomeAboard: _n,
    backgroundNotifications: _o,
    ...device
  } = config;
  return {
    device: {
      ...device,
      enableLateDayFlip: config.schedule.enableLateDayFlip,
      // defaultPreferences is owned by the caller (it is only edited while no account is active).
      defaultPreferences: defaultAccountPreferences,
    },
    preferences,
    server: pickServerProfileFields(config),
  };
};

/**
 * Midnight in the port time zone on the given date-only string. Timezone-safe, unlike building a
 * Date from the string directly.
 */
const buildCruiseStartDateFromStr = (dateStr: string, portTimeZoneID: string): Date =>
  moment.tz(dateStr, 'YYYY-MM-DD', portTimeZoneID).toDate();

/**
 * The config fields of a (possibly sparse) server profile, leaving out its identity fields.
 */
const pickProfileConfig = (profile: Partial<ServerProfileFields>): Partial<ServerProfileFields> => ({
  cruiseStartDateStr: profile.cruiseStartDateStr,
  cruiseLength: profile.cruiseLength,
  portTimeZoneID: profile.portTimeZoneID,
  schedBaseUrl: profile.schedBaseUrl,
  shipCode: profile.shipCode,
  wifiNetworkNames: profile.wifiNetworkNames,
  dismissMinAccessWarning: profile.dismissMinAccessWarning,
  canonicalHostnames: profile.canonicalHostnames,
});

/**
 * Merge device config, the active account's preferences and the active server profile into the
 * effective config that `useConfig()` consumers read. Headless code gets the same view from
 * getEffectiveConfig.
 */
export const mergeAppConfig = (
  device: DeviceConfig,
  preferences: AccountPreferences,
  profile?: Partial<ServerProfileFields> | null,
): AppConfig => {
  const {enableLateDayFlip, defaultPreferences: _defaultPreferences, ...deviceRest} = device;
  // Only the profile's config fields. The profile also carries its own serverUrl (the session's
  // server), which must not replace AppConfig.serverUrl, the device's default for a new session.
  const server: ServerProfileFields = {
    ...defaultServerProfileFields,
    ...stripUndefined(pickProfileConfig(profile ?? {})),
  };
  return {
    ...deviceRest,
    ...preferences,
    schedule: {...preferences.schedule, enableLateDayFlip},
    ...server,
    cruiseStartDate: buildCruiseStartDateFromStr(server.cruiseStartDateStr, server.portTimeZoneID),
  };
};

/**
 * Drop undefined values so a sparse ServerProfile does not blank out the defaults beneath it.
 */
const stripUndefined = <T extends object>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;

/**
 * Fill in fields that stored preferences from older releases lack and revive the mute Date.
 */
export const reviveAccountPreferences = (raw: Partial<AccountPreferences>): AccountPreferences => {
  const base = defaultAccountPreferences;
  const prefs: AccountPreferences = {
    ...base,
    ...raw,
    pushNotifications: {...base.pushNotifications, ...raw.pushNotifications},
    userPreferences: {...base.userPreferences, ...raw.userPreferences},
    schedule: {...base.schedule, ...raw.schedule},
  };
  if (raw.muteNotifications) {
    prefs.muteNotifications = new Date(raw.muteNotifications);
  } else {
    delete prefs.muteNotifications;
  }
  return prefs;
};

/**
 * Default device config, derived from the default effective config.
 */
export const defaultDeviceConfig: DeviceConfig = splitAppConfig(defaultAppConfig).device;

/**
 * Fill in device fields that a stored APP_CONFIG_V3 from an older release lacks.
 */
const reviveDeviceConfig = (raw: Partial<DeviceConfig>): DeviceConfig => ({
  ...defaultDeviceConfig,
  ...raw,
  apiClientConfig: {...defaultDeviceConfig.apiClientConfig, ...raw.apiClientConfig},
  accessibility: {...defaultDeviceConfig.accessibility, ...raw.accessibility},
  defaultPreferences: reviveAccountPreferences(raw.defaultPreferences ?? {}),
});

/**
 * Returns the device config: APP_CONFIG_V3 if present, else the defaults.
 */
export const getDeviceConfig = async (): Promise<DeviceConfig> => {
  const raw = await AsyncStorage.getItem(StorageKeys.APP_CONFIG);
  if (raw) {
    return reviveDeviceConfig(JSON.parse(raw) as Partial<DeviceConfig>);
  }
  return defaultDeviceConfig;
};

/**
 * Persist the device config (APP_CONFIG_V3).
 */
export const saveDeviceConfig = async (config: DeviceConfig): Promise<void> => {
  await AsyncStorage.setItem(StorageKeys.APP_CONFIG, JSON.stringify(config));
};
