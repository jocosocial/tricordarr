/**
 * Lifted from https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Enumerations/FezType.swift
 * These have to stay lower-case in the values since those are what get POST'd to the server.
 */
export enum FezType {
  announcement = 'announcement',
  /// A closed chat. Participants are set at creation and can't be changed. No location, start/end time, or capacity. Not moderated.
  closed = 'closed',
  /// An open chat. Participants can be added/removed after creation *and your UI should make this clear*. No location, start/end time, or capacity.
  open = 'open',
  /// Some type of activity.
  activity = 'activity',
  /// A dining LFG.
  dining = 'dining',
  /// A gaming LFG.
  gaming = 'gaming',
  /// A general meetup.
  meetup = 'meetup',
  /// A music-related LFG.
  music = 'music',
  /// Some other type of LFG.
  other = 'other',
  /// A shore excursion LFG.
  shore = 'shore',
  /// A personal calendar event. Has a location and start/end time, but no participants and no chat. Operates just like an event in your phone's Calendar app.
  personalEvent = 'personalEvent',
  /// A calendar event where the owner can add other users (like an open chat), but should display the event's location and time. No capacity.
  /// Unlike LFGs, there's no searching for events you don't belong to.
  privateEvent = 'privateEvent',
}

export namespace FezType {
  export const getLabel = (fezType?: FezType) => {
    switch (fezType) {
      case FezType.closed:
        return 'Private Chat';
      case FezType.open:
        return 'Open Chat';
      case FezType.privateEvent:
        return 'Private Event';
      case FezType.personalEvent:
        return 'Personal Event';
      default:
        if (!fezType) {
          return 'Unknown';
        }
        return fezType.charAt(0).toUpperCase() + fezType.slice(1);
    }
  };

  /// The types that are LFGs, and a computed property to test it.
  export const lfgTypes: FezType[] = [
    FezType.activity,
    FezType.dining,
    FezType.gaming,
    FezType.meetup,
    FezType.music,
    FezType.other,
    FezType.shore,
  ];

  export const isLFGType = (fezType: FezType) => lfgTypes.some(t => t === fezType);

  /// Types that are Seamails.
  export const seamailTypes: FezType[] = [FezType.open, FezType.closed];

  export const isSeamailType = (fezType: FezType) => seamailTypes.some(t => t === fezType);

  /// The types that are LFGs, and a computed property to test it.
  export const privateEventTypes: FezType[] = [FezType.privateEvent, FezType.personalEvent];

  export const isPrivateEventType = (fezType: FezType) => privateEventTypes.some(t => t === fezType);
}
