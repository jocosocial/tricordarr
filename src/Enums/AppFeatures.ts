export enum SwiftarrClientApp {
  /// The website, but NOT the API layer
  swiftarr = 'swiftarr',
  /// Client apps that consume the Swiftarr API
  cruisemonkey = 'cruisemonkey',
  rainbowmonkey = 'rainbowmonkey',
  kraken = 'kraken',
  tricordarr = 'tricordarr',
  tacobarr = 'tacobarr',
  /// A feature disabled for `all` will be turned off at the API layer , meaning that calls to that area of the API will return errors. Clients should still attempt
  /// to use disabledFeatures to indicate the cause, rather than just displaying HTTP status errors.
  all = 'all',
  /// For clients use. Clients need to be prepared for additional values to be added serverside. Those new values get decoded as 'unknown'.
  unknown = 'unknown',
}

export namespace SwiftarrClientApp {
  /**
   * Consumer-friendly name for a client app in admin UI.
   */
  export const getLabel = (app: SwiftarrClientApp | string): string => {
    switch (app) {
      case SwiftarrClientApp.swiftarr:
        return 'Swiftarr Web';
      case SwiftarrClientApp.tricordarr:
        return 'Tricordarr';
      case SwiftarrClientApp.kraken:
        return 'Kraken';
      case SwiftarrClientApp.cruisemonkey:
        return 'Cruise Monkey';
      case SwiftarrClientApp.rainbowmonkey:
        return 'Rainbow Monkey';
      case SwiftarrClientApp.tacobarr:
        return 'TacoBarr';
      case SwiftarrClientApp.all:
        return 'All Clients';
      default:
        return app;
    }
  };
}

/// Functional areas of the Swiftarr API. Used in the `SettingsAppFeaturePair` struct.
/// Clients: Be sure to anticipate server values not listed here.
export enum SwiftarrFeature {
  tweets = 'tweets',
  forums = 'forums',
  seamail = 'seamail',
  schedule = 'schedule',
  friendlyfez = 'friendlyfez',
  karaoke = 'karaoke',
  microkaraoke = 'microkaraoke',
  gameslist = 'gameslist',
  images = 'images',
  users = 'users',
  phone = 'phone',
  directphone = 'directphone',
  photostream = 'photostream',
  performers = 'performers',
  personalevents = 'personalevents',
  registration = 'registration',
  hunts = 'hunts',
  eventFeedback = 'eventFeedback',
  quartermaster = 'quartermaster',
  all = 'all',
  /// For clients use. Clients need to be prepared for additional values to be added serverside. Those new values get decoded as 'unknown'.
  unknown = 'unknown',
}

export namespace SwiftarrFeature {
  /**
   * Consumer-friendly name for a feature in admin UI.
   */
  export const getLabel = (feature: SwiftarrFeature | string): string => {
    switch (feature) {
      case SwiftarrFeature.tweets:
        return 'Tweets';
      case SwiftarrFeature.forums:
        return 'Forums';
      case SwiftarrFeature.seamail:
        return 'Seamail';
      case SwiftarrFeature.schedule:
        return 'Schedule';
      case SwiftarrFeature.friendlyfez:
        return 'Looking For Group';
      case SwiftarrFeature.karaoke:
        return 'Karaoke';
      case SwiftarrFeature.microkaraoke:
        return 'Micro Karaoke';
      case SwiftarrFeature.gameslist:
        return 'Board Games';
      case SwiftarrFeature.images:
        return 'Images';
      case SwiftarrFeature.users:
        return 'Users';
      case SwiftarrFeature.phone:
        return 'KrakenTalk';
      case SwiftarrFeature.directphone:
        return 'Direct Phone';
      case SwiftarrFeature.photostream:
        return 'Photostream';
      case SwiftarrFeature.performers:
        return 'Performers';
      case SwiftarrFeature.personalevents:
        return 'Personal Events';
      case SwiftarrFeature.registration:
        return 'Registration';
      case SwiftarrFeature.hunts:
        return 'Puzzle Hunts';
      case SwiftarrFeature.eventFeedback:
        return 'Event Feedback';
      case SwiftarrFeature.quartermaster:
        return 'Quartermaster';
      case SwiftarrFeature.all:
        return 'All Features';
      default:
        return feature;
    }
  };

  /**
   * Short description of what disabling this feature does.
   */
  export const getDescription = (feature: SwiftarrFeature | string): string => {
    switch (feature) {
      case SwiftarrFeature.all:
        return 'Disable every feature for the selected client(s).';
      case SwiftarrFeature.tweets:
        return 'The tweet / twarrt stream.';
      case SwiftarrFeature.forums:
        return 'Forum categories, threads, and posts.';
      case SwiftarrFeature.seamail:
        return 'Private messaging.';
      case SwiftarrFeature.schedule:
        return 'Official events and the calendar.';
      case SwiftarrFeature.friendlyfez:
        return 'Looking For Group events.';
      case SwiftarrFeature.karaoke:
        return 'Karaoke song list and performances.';
      case SwiftarrFeature.microkaraoke:
        return 'Micro Karaoke clips and songs.';
      case SwiftarrFeature.gameslist:
        return 'Board game catalog.';
      case SwiftarrFeature.images:
        return 'Image upload and display.';
      case SwiftarrFeature.users:
        return 'User directory and profiles.';
      case SwiftarrFeature.phone:
        return 'On-board voice calls.';
      case SwiftarrFeature.directphone:
        return 'Direct (non-server) phone calls.';
      case SwiftarrFeature.photostream:
        return 'Photostream uploads and feed.';
      case SwiftarrFeature.performers:
        return 'Official and shadow performers.';
      case SwiftarrFeature.personalevents:
        return 'Personal events and the day planner.';
      case SwiftarrFeature.registration:
        return 'New account creation.';
      case SwiftarrFeature.hunts:
        return 'Puzzle hunts and quizzes.';
      case SwiftarrFeature.eventFeedback:
        return 'Shadow event host feedback form.';
      case SwiftarrFeature.quartermaster:
        return 'Have / need item board.';
      default:
        return '';
    }
  };
}
