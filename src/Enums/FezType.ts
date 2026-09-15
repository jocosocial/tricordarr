import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';

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

export enum FezChatCategory {
  seamail = 'seamail',
  privateEvent = 'privateEvent',
  lfg = 'lfg',
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

  export const getChatTitle = (fezType: FezType): string => {
    if (FezType.isLFGType(fezType)) {
      return 'LFG Chat';
    } else if (FezType.isSeamailType(fezType)) {
      return 'Seamail Chat';
    } else if (FezType.isPrivateEventType(fezType)) {
      return 'Private Event Chat';
    }
    return 'Unknown Chat';
  };

  export const getChatTypeString = (fezType: FezType) => {
    if (FezType.isLFGType(fezType)) {
      return 'LFG';
    } else if (FezType.isSeamailType(fezType)) {
      return 'Seamail';
    } else if (FezType.isPrivateEventType(fezType)) {
      return 'Private Event';
    }
    return 'Unknown';
  };

  export const getHelpRoute = (fezType: FezType) => {
    if (FezType.isLFGType(fezType)) {
      return CommonStackComponents.lfgHelpScreen;
    } else if (FezType.isSeamailType(fezType)) {
      return CommonStackComponents.seamailHelpScreen;
    } else if (FezType.isPrivateEventType(fezType)) {
      return CommonStackComponents.scheduleHelpScreen;
    }
    // Default is gonna be Seamail. MainHelp isn't part of Common and I'm not sure
    // yet if I want to do that just for this.
    return CommonStackComponents.seamailHelpScreen;
  };

  export const getChatScreen = (fezType: FezType) => {
    if (FezType.isLFGType(fezType)) {
      return CommonStackComponents.lfgChatScreen;
    } else if (fezType === FezType.privateEvent) {
      return CommonStackComponents.privateEventChatScreen;
    }
    return CommonStackComponents.seamailChatScreen;
  };

  /// Joined-chat types shown in the Seamail inbox. Personal Events have no chat.
  export const chatTypes: FezType[] = [...seamailTypes, FezType.privateEvent, ...lfgTypes];

  export const chatCategories: FezChatCategory[] = [
    FezChatCategory.seamail,
    FezChatCategory.privateEvent,
    FezChatCategory.lfg,
  ];

  export const getChatCategoryLabel = (category: FezChatCategory) => {
    switch (category) {
      case FezChatCategory.seamail:
        return 'Seamail';
      case FezChatCategory.privateEvent:
        return 'Private Event';
      case FezChatCategory.lfg:
        return 'LFG';
    }
  };

  /**
   * Chat categories that may appear in the Seamail list for the given include preferences.
   */
  export const allowedChatCategories = (includeLfgs: boolean, includePrivateEvents: boolean): FezChatCategory[] => {
    return chatCategories.filter(category => {
      switch (category) {
        case FezChatCategory.lfg:
          return includeLfgs;
        case FezChatCategory.privateEvent:
          return includePrivateEvents;
        default:
          return true;
      }
    });
  };

  /**
   * Resolves Fez types to query for the Seamail list.
   * An empty selection means all allowed categories. Categories not in `allowedCategories` are ignored.
   */
  export const fezTypesForChatCategories = (
    categories: FezChatCategory[],
    allowedCategories: FezChatCategory[] = chatCategories,
  ): FezType[] => {
    const selected = categories.length > 0 ? categories : allowedCategories;
    const effective = selected.filter(c => allowedCategories.includes(c));
    const types: FezType[] = [];
    if (effective.includes(FezChatCategory.seamail)) {
      types.push(...seamailTypes);
    }
    if (effective.includes(FezChatCategory.privateEvent)) {
      types.push(FezType.privateEvent);
    }
    if (effective.includes(FezChatCategory.lfg)) {
      types.push(...lfgTypes);
    }
    return types.length > 0 ? types : [...seamailTypes];
  };
}
