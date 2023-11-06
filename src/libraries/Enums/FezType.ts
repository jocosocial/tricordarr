/**
 * Lifted from https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Enumerations/FezType.swift
 */
export enum FezType {
  announcement = 'Announcement',
  /// A closed chat. Participants are set at creation and can't be changed. No location, start/end time, or capacity.
  closed = 'Closed',
  /// An open chat. Participants can be added/removed after creation *and your UI should make this clear*. No location, start/end time, or capacity.
  open = 'Open',
  /// Some type of activity.
  activity = 'Activity',
  /// A dining LFG.
  dining = 'Dining',
  /// A gaming LFG.
  gaming = 'Gaming',
  /// A general meetup.
  meetup = 'Meetup',
  /// A music-related LFG.
  music = 'Music',
  /// Some other type of LFG.
  other = 'Other',
  /// A shore excursion LFG.
  shore = 'Shore',
}
