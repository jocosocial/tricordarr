/** One custom emoji as `GET /client/emoji` returns it. */
export interface CustomEmojiData {
  /// The token typed in posts and stored as a reaction, such as `:arr:`.
  reaction: string;
  /// A human-readable name, used as the emoji's accessibility label.
  name: string;
  /// Where the image lives, relative to the server.
  imageURL: string;
  /// Secret emoji render like any other but are left out of pickers and emoji lists.
  secret?: boolean;
}

export interface CustomEmojiEntry {
  uri: string;
  secret: boolean;
  name: string;
}

/** Custom emoji keyed by token, such as `:arr:`. */
export type CustomEmojiCatalog = Record<string, CustomEmojiEntry>;

/**
 * An empty catalog. It has no prototype because it is indexed with arbitrary text from posts and
 * reactions: on an ordinary object, looking up `constructor` or `toString` finds an inherited
 * member and the word would be treated as an emoji.
 */
export const emptyCustomEmojiCatalog = (): CustomEmojiCatalog => Object.create(null);

/**
 * Builds the catalog from Swiftarr's answer. The server is the only definition of custom emoji, so
 * with no answer yet there are none and their tokens render as plain text.
 */
export const buildCustomEmojiCatalog = (data: CustomEmojiData[] | undefined, serverUrl: string): CustomEmojiCatalog => {
  const catalog = emptyCustomEmojiCatalog();
  for (const emoji of data ?? []) {
    try {
      catalog[emoji.reaction] = {
        uri: new URL(emoji.imageURL, serverUrl).toString(),
        secret: !!emoji.secret,
        name: emoji.name,
      };
    } catch {
      // An image URL that cannot be resolved leaves that one emoji as text rather than breaking the rest.
    }
  }
  return catalog;
};

/** The name to read out for a reaction: a custom emoji's name, or the Unicode emoji itself. */
export const reactionAccessibilityName = (catalog: CustomEmojiCatalog, reaction: string): string =>
  catalog[reaction]?.name ?? reaction;
