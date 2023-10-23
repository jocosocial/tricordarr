/**
 * Event Types
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Enumerations/EventType.swift
 * @TODO I'm not sure this is useful yet.
 */
export const EventType = {
  /// A gaming event.
  gaming: 'Gaming',
  /// An official but uncategorized event.
  general: 'Official',
  /// A live podcast event.
  livePodcast: 'Live Podcast',
  /// A main concert event.
  mainConcert: 'Main Concert',
  /// An office hours event.
  officeHours: 'Office Hours',
  /// A party event.
  party: 'Party',
  /// A q&a/panel event.
  qaPanel: 'Q&A/Panel',
  /// A reading/performance event.
  readingPerformance: 'Reading/Performance',
  /// A shadow cruise event.
  shadow: 'Shadow Event',
  /// A signing event.
  signing: 'Signing',
  /// A workshop event.
  workshop: 'Workshop',
} as const;
