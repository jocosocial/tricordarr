import {FezType} from '../Enums/FezType';
import {DinnerTeam} from '../Enums/DinnerTeam';
import {EventData, UserHeader} from '../Structs/ControllerStructs.tsx';
import {ServerUrlChoice} from '../Network/ServerChoices.ts';

export interface SettingFormValues {
  settingValue: string;
}

export interface LoginFormValues {
  username: string;
  password: string;
}

export interface UserRegistrationFormValues {
  username: string;
  password: string;
  passwordVerify: string;
  verification: string;
}

export interface UserProfileFormValues {
  displayName: string;
  realName: string;
  preferredPronoun: string;
  homeLocation: string;
  roomNumber: string;
  email: string;
  message: string;
  about: string;
  dinnerTeam: string;
}

export interface UserNoteFormValues {
  note: string;
}

export interface KeywordFormValues {
  keyword: string;
}

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  newPasswordVerify: string;
}

export interface ChangeUsernameFormValues {
  username: string;
}

export interface FezFormValues {
  title: string;
  location: string;
  fezType: FezType;
  startDate: Date;
  duration: string;
  minCapacity: string;
  maxCapacity: string;
  info: string;
  startTime: {
    hours: number;
    minutes: number;
  };
}

export interface SeamailFormValues {
  fezType: FezType;
  info: string;
  initialUsers: UserHeader[];
  maxCapacity: number;
  minCapacity: number;
  title: string;
  createdByTwitarrTeam: boolean;
  createdByModerator: boolean;
}

export interface ForumThreadValues {
  title: string;
  postAsModerator?: boolean;
  postAsTwitarrTeam?: boolean;
}

export interface CruiseSettingsFormValues {
  startDate: Date;
  cruiseLength: string;
  portTimeZoneID: string;
  schedBaseUrl: string;
}

export interface QuerySettingsFormValues {
  defaultPageSize: number;
  cacheTimeDays: number;
  retry: number;
  staleTimeMinutes: number;
  disruptionThreshold: number;
  imageStaleTimeHours: number;
}

export interface NotificationPollingSettingsFormValues {
  notificationPollIntervalMinutes: number;
  enableNotificationPolling: boolean;
}

export interface PhotostreamCreateFormValues {
  eventData?: EventData;
  locationName?: string;
  image?: string;
}

export interface ServerUrlFormValues {
  serverChoice: ServerUrlChoice;
  serverUrl: string;
}

export interface PersonalEventFormValues {
  title: string;
  description?: string;
  location?: string;
  participants: UserHeader[];
  startDate: Date;
  duration: string;
  startTime: {
    hours: number;
    minutes: number;
  };
}
