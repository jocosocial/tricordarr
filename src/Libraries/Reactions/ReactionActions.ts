import {FezData, FezPostData, PostData, ReactionData} from '#src/Structs/ControllerStructs';

/**
 * The post a reaction applies to. Forum and chat posts react through different endpoints and
 * caches, so everything reaction-related takes one of these rather than existing twice.
 */
export type ReactionTarget =
  | {kind: 'forumPost'; post: PostData; forumID?: string}
  /** `fez` is optional because some screens preview a chat post without its chat. */
  | {kind: 'fezPost'; post: FezPostData; fez?: FezData};

export type ReactionAction = 'create' | 'delete';

/** Identifies a post across forums and chats, whose post IDs are numbered separately. */
export const reactionTargetKey = (kind: ReactionTarget['kind'], postID: number): string => `${kind}:${postID}`;

/**
 * What tapping a reaction badge should do: remove the reaction if the user already reacted with
 * it, otherwise add it. Reaction identity uses the exact Unicode sequence or custom token.
 */
export const reactionToggleAction = (
  reactions: ReactionData[] | undefined,
  userID: string,
  reaction: string,
): ReactionAction => (ReactionData.hasUserReacted(reactions ?? [], userID, reaction) ? 'delete' : 'create');

/**
 * Whether the user may react to the post at all. Swiftarr refuses reactions on your own posts, and
 * a chat post without its chat has no cache to update.
 */
export const canReactTo = (target: ReactionTarget, userID: string | null | undefined): boolean => {
  if (!userID || userID === target.post.author.userID) {
    return false;
  }
  return target.kind === 'forumPost' || !!target.fez;
};
