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

/// Functional areas of the Swiftarr API. Used in the `SettingsAppFeaturePair` struct.
/// Clients: Be sure to anticipate server values not listed here.
export enum SwiftarrFeature {
  tweets = 'tweets',
  forums = 'forums',
  seamail = 'seamail',
  schedule = 'schedule',
  friendlyfez = 'friendlyfez',
  karaoke = 'karaoke',
  gameslist = 'gameslist',
  images = 'images',
  users = 'users',
  phone = 'phone',
  directphone = 'directphone',
  all = 'all',
  photostream = 'photostream',
  /// For clients use. Clients need to be prepared for additional values to be added serverside. Those new values get decoded as 'unknown'.
  unknown = 'unknown',
}
