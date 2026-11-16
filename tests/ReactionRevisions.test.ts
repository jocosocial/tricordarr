import {
  applyFezPostReactions,
  applyPostDetailReactions,
  applyPostReactions,
} from '#src/Libraries/Reactions/ReactionCacheReduction';
import {shareReactionSnapshots} from '#src/Libraries/Reactions/ReactionSnapshotSharing';
import {FezData, PostData, PostDetailData, ReactionData} from '#src/Structs/ControllerStructs';

describe('reaction snapshot revisions', () => {
  const reactions: ReactionData[] = [{reaction: '👍', users: []}];

  it('keeps live reactions across a delayed page refetch while accepting edited text', () => {
    const post = {postID: 1, reactions, reactionRevision: 3, text: 'old'};
    const oldData = {pages: [{members: {posts: [post]}}]};
    const newData = {pages: [{members: {posts: [{...post, reactions: [], reactionRevision: 2, text: 'edited'}]}}]};
    expect(shareReactionSnapshots(oldData, newData)).toEqual({
      pages: [{members: {posts: [{...post, text: 'edited'}]}}],
    });
  });

  it('keeps a newer WebSocket snapshot when an older HTTP response arrives', () => {
    const post = {postID: 1, reactions, reactionRevision: 3} as PostData;
    const stale = {...post, reactions: [], reactionRevision: 2};
    expect(applyPostReactions(post, stale)).toBe(post);
    const detail = {...post} as unknown as PostDetailData;
    expect(applyPostDetailReactions(detail, stale)).toBe(detail);
    const fez = {members: {posts: [post]}} as unknown as FezData;
    expect(applyFezPostReactions(fez, 1, [], 2).members?.posts?.[0]).toBe(post);
  });

  it('accepts a newer empty snapshot and refuses older or unversioned replacements', () => {
    const post = {postID: 1, reactions, reactionRevision: 3} as PostData;
    const updated = applyPostReactions(post, {...post, reactions: [], reactionRevision: 4});
    expect(updated.reactions).toEqual([]);
    expect(updated.reactionRevision).toBe(4);
    expect(applyPostReactions(updated, {...post, reactionRevision: undefined})).toBe(updated);
    const fez = {members: {posts: [post]}} as unknown as FezData;
    const next = applyFezPostReactions(fez, 1, [], 4);
    expect(applyFezPostReactions(next, 1, reactions, 3).members?.posts?.[0].reactions).toEqual([]);
  });

  it('updates old cached payloads that have no revision', () => {
    const post = {postID: 1, reactions: []} as unknown as PostData;
    expect(applyPostReactions(post, {...post, reactions, reactionRevision: 1}).reactions).toEqual(reactions);
  });
});
