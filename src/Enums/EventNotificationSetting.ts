/**
 * Different settings for event and LFG notifications.
 *
 * From https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Enumerations/EventNotificationSetting.swift
 */
export enum EventNotificationSetting {
  /// Notifications should be disabled.
  disabled = 'disabled',
  /// Pretend that we are at this time but during the cruise week.
  cruiseWeek = 'cruiseWeek',
  /// The current actual real time and date.
  current = 'current',
}

export namespace EventNotificationSetting {
  /**
   * Returns a consumer-friendly label for the notification setting.
   */
  export const getLabel = (setting: EventNotificationSetting): string => {
    switch (setting) {
      case EventNotificationSetting.disabled:
        return 'Disabled';
      case EventNotificationSetting.cruiseWeek:
        return 'Cruise Week';
      case EventNotificationSetting.current:
        return 'Current Time';
    }
  };

  /**
   * Returns a user-facing description of how the setting affects notifications.
   */
  export const getDescription = (setting: EventNotificationSetting): string => {
    switch (setting) {
      case EventNotificationSetting.disabled:
        return 'Do not send upcoming event notifications.';
      case EventNotificationSetting.cruiseWeek:
        return 'Fire notifications as if the device were on the cruise calendar.';
      case EventNotificationSetting.current:
        return 'Fire notifications based on the real current time.';
    }
  };

  /**
   * All known settings, excluding unknown future values.
   */
  export const all: EventNotificationSetting[] = [
    EventNotificationSetting.disabled,
    EventNotificationSetting.cruiseWeek,
    EventNotificationSetting.current,
  ];
}
