// https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Controllers/UsersController.swift

/**
 * Sort orders accepted by the user match endpoint (/users/match/allnames/:search_string).
 * Values are the literal API query parameter values.
 */
export enum UserMatchSort {
  /** Users you have favorited come first. */
  favorites = 'favorites',
}
