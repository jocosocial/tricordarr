import {LikeType} from '#src/Enums/LikeType';
import {postDataFromDetail} from '#src/Libraries/Moderation/Content';
import {
  buildCustomEmojiCatalog,
  CustomEmojiData,
  reactionAccessibilityName,
} from '#src/Libraries/Reactions/CustomEmojiCatalog';
import {canReactTo, reactionToggleAction} from '#src/Libraries/Reactions/ReactionActions';
import {
  applyFezPostReactions,
  applyPostDetailReactions,
  applyPostReactions,
} from '#src/Libraries/Reactions/ReactionCacheReduction';
import {FezData, FezPostData, PostData, PostDetailData, ReactionData, UserHeader} from '#src/Structs/ControllerStructs';
import {
  isSocketFezMemberChangeData,
  isSocketFezPostData,
  isSocketFezReactionData,
  SocketFezMessage,
} from '#src/Structs/SocketStructs';

const james: UserHeader = {userID: 'james-id', username: 'james'};
const heidi: UserHeader = {userID: 'heidi-id', username: 'heidi'};

const thumbs: ReactionData = {reaction: '👍', users: [james, heidi]};
const arr: ReactionData = {reaction: ':arr:', users: [heidi]};

const makeFezPost = (postID: number, reactions?: ReactionData[]): FezPostData => ({
  postID,
  author: james,
  text: `Post ${postID}`,
  timestamp: '2026-01-01T00:00:00Z',
  reactions,
});

// Only the fields the reducer reads matter here.
const makeFez = (posts?: FezPostData[]): FezData => {
  const fez: Partial<FezData> = {
    fezID: 'fez-id',
    members: {
      participants: [james, heidi],
      waitingList: [],
      postCount: posts?.length ?? 0,
      readCount: 1,
      isMuted: false,
      isFavorite: false,
      posts,
    },
  };
  return fez as FezData;
};

const makePost = (overrides: Partial<PostData> = {}): PostData => ({
  postID: 7,
  createdAt: '2026-01-01T00:00:00Z',
  author: james,
  text: 'Cached text',
  isBookmarked: true,
  likeCount: 0,
  ...overrides,
});

describe('ReactionData.hasUserReacted', () => {
  it('finds a user on any reaction when no reaction is given', () => {
    expect(ReactionData.hasUserReacted([thumbs, arr], james.userID)).toBe(true);
    expect(ReactionData.hasUserReacted([arr], james.userID)).toBe(false);
  });

  it('restricts the search to the given reaction', () => {
    expect(ReactionData.hasUserReacted([thumbs, arr], james.userID, '👍')).toBe(true);
    expect(ReactionData.hasUserReacted([thumbs, arr], james.userID, ':arr:')).toBe(false);
  });

  it('compares reactions exactly, so a picked emoji does not match its stored canonical form', () => {
    // Swiftarr strips the variation selector: a picked "☺️" is stored and returned as "☺". This is
    // why the picker only ever adds, and removal goes through the badge's own stored string.
    const stored: ReactionData = {reaction: '☺', users: [james]};
    expect(ReactionData.hasUserReacted([stored], james.userID, '☺️')).toBe(false);
    expect(ReactionData.hasUserReacted([stored], james.userID, stored.reaction)).toBe(true);
  });

  it('is false for empty reactions', () => {
    expect(ReactionData.hasUserReacted([], james.userID)).toBe(false);
  });
});

describe('reactionToggleAction', () => {
  it('removes a reaction the user already has', () => {
    expect(reactionToggleAction([thumbs, arr], james.userID, '👍')).toBe('delete');
  });

  it('adds a reaction the user does not have, even when others do', () => {
    expect(reactionToggleAction([thumbs, arr], james.userID, ':arr:')).toBe('create');
  });

  it('adds when the post has no reactions yet', () => {
    expect(reactionToggleAction(undefined, james.userID, '👍')).toBe('create');
    expect(reactionToggleAction([], james.userID, '👍')).toBe('create');
  });

  it('would add rather than remove for a picked emoji that differs from its stored form', () => {
    // The reason the picker is add-only and only badges, which hold the stored string, toggle.
    const stored: ReactionData = {reaction: '☺', users: [james]};
    expect(reactionToggleAction([stored], james.userID, '☺️')).toBe('create');
    expect(reactionToggleAction([stored], james.userID, stored.reaction)).toBe('delete');
  });
});

describe('canReactTo', () => {
  const heidisPost = makePost({author: heidi});

  it("allows reacting to another user's forum post", () => {
    expect(canReactTo({kind: 'forumPost', post: heidisPost}, james.userID)).toBe(true);
  });

  it("refuses the user's own post", () => {
    expect(canReactTo({kind: 'forumPost', post: heidisPost}, heidi.userID)).toBe(false);
    expect(canReactTo({kind: 'fezPost', post: makeFezPost(1), fez: makeFez([])}, james.userID)).toBe(false);
  });

  it('refuses when signed out', () => {
    expect(canReactTo({kind: 'forumPost', post: heidisPost}, null)).toBe(false);
    expect(canReactTo({kind: 'forumPost', post: heidisPost}, undefined)).toBe(false);
  });

  it('needs the chat for a chat post, since its cache is what gets updated', () => {
    const post = makeFezPost(1);
    expect(canReactTo({kind: 'fezPost', post, fez: makeFez([post])}, heidi.userID)).toBe(true);
    expect(canReactTo({kind: 'fezPost', post}, heidi.userID)).toBe(false);
  });
});

describe('applyFezPostReactions', () => {
  it('replaces only the matching post and leaves counts alone', () => {
    const fez = makeFez([makeFezPost(1, [arr]), makeFezPost(2)]);
    const result = applyFezPostReactions(fez, 2, [thumbs]);
    expect(result.members?.posts?.map(post => post.reactions)).toEqual([[arr], [thumbs]]);
    expect(result.members?.posts?.[0]).toBe(fez.members?.posts?.[0]);
    expect(result.members?.postCount).toBe(2);
    expect(result.members?.readCount).toBe(1);
  });

  it('clears reactions when the last one is removed', () => {
    const result = applyFezPostReactions(makeFez([makeFezPost(1, [arr])]), 1, []);
    expect(result.members?.posts?.[0].reactions).toEqual([]);
  });

  it('returns the same object when the page holds no posts', () => {
    const withoutPosts = makeFez(undefined);
    expect(applyFezPostReactions(withoutPosts, 1, [thumbs])).toBe(withoutPosts);
    const withoutMembers = {fezID: 'fez-id'} as FezData;
    expect(applyFezPostReactions(withoutMembers, 1, [thumbs])).toBe(withoutMembers);
  });
});

describe('applyPostReactions', () => {
  it('copies reaction fields and keeps everything else from the cached post', () => {
    const cached = makePost({isPinned: true});
    const updated = makePost({
      text: 'Server text',
      isBookmarked: false,
      userLike: LikeType.like,
      likeCount: 2,
      reactions: [thumbs],
    });
    expect(applyPostReactions(cached, updated)).toEqual({
      ...cached,
      userLike: LikeType.like,
      likeCount: 2,
      reactions: [thumbs],
    });
  });

  it('clears the legacy like when the reaction was removed', () => {
    const cached = makePost({userLike: LikeType.love, likeCount: 1, reactions: [thumbs]});
    const result = applyPostReactions(cached, makePost({reactions: []}));
    expect(result.userLike).toBeUndefined();
    expect(result.likeCount).toBe(0);
    expect(result.reactions).toEqual([]);
  });
});

describe('applyPostDetailReactions', () => {
  it('copies reaction fields onto the cached detail', () => {
    const detail: PostDetailData = {
      postID: 7,
      forumID: 'forum-id',
      createdAt: '2026-01-01T00:00:00Z',
      author: james,
      text: 'Cached text',
      isBookmarked: true,
      laughs: [],
      likes: [],
      loves: [],
    };
    const result = applyPostDetailReactions(detail, makePost({userLike: LikeType.laugh, reactions: [arr]}));
    expect(result).toEqual({...detail, userLike: LikeType.laugh, reactions: [arr]});
  });
});

describe('chat socket message guards', () => {
  const reactionUpdate: SocketFezMessage = {reactionUpdate: true, postID: 5, reactions: [thumbs]};
  const newPost: SocketFezMessage = {postID: 5, author: james, text: 'Hello', timestamp: '2026-01-01T00:00:00Z'};
  const memberChange: SocketFezMessage = {user: heidi, joined: true};

  it('recognises a reaction update', () => {
    expect(isSocketFezReactionData(reactionUpdate)).toBe(true);
    expect(isSocketFezReactionData(newPost)).toBe(false);
    expect(isSocketFezReactionData(memberChange)).toBe(false);
  });

  it('does not treat a reaction update as a new post, though both carry a postID', () => {
    expect(isSocketFezPostData(reactionUpdate)).toBe(false);
    expect(isSocketFezPostData(newPost)).toBe(true);
    expect(isSocketFezPostData(memberChange)).toBe(false);
  });

  it('recognises a membership change', () => {
    expect(isSocketFezMemberChangeData(memberChange)).toBe(true);
    expect(isSocketFezMemberChangeData(reactionUpdate)).toBe(false);
    expect(isSocketFezMemberChangeData(newPost)).toBe(false);
  });
});

describe('postDataFromDetail', () => {
  it('keeps reactions when a moderated post is converted for editing', () => {
    const detail: PostDetailData = {
      postID: 7,
      forumID: 'forum-id',
      createdAt: '2026-01-01T00:00:00Z',
      author: james,
      text: 'Cached text',
      isBookmarked: false,
      laughs: [],
      likes: [heidi],
      loves: [],
      reactions: [thumbs],
    };
    expect(postDataFromDetail(detail).reactions).toEqual([thumbs]);
  });
});

describe('buildCustomEmojiCatalog', () => {
  const server = 'https://twitarr.example';
  const data: CustomEmojiData[] = [
    {reaction: ':arr:', name: 'arr', imageURL: '/img/emoji/small/arr.png', secret: false},
    {reaction: ':mbta:', name: 'MBTA', imageURL: '/img/emoji/small/mbta.png', secret: true},
    // A server that predates the secret flag omits it.
    {reaction: ':joco:', name: 'Joco', imageURL: '/img/emoji/small/joco.png'},
  ];

  it('is empty until the server has answered, since the app bundles no emoji', () => {
    expect(Object.keys(buildCustomEmojiCatalog(undefined, server))).toEqual([]);
  });

  it('resolves image URLs against the server and carries the secret flag', () => {
    const catalog = buildCustomEmojiCatalog(data, server);
    expect(catalog[':arr:']).toEqual({uri: `${server}/img/emoji/small/arr.png`, secret: false, name: 'arr'});
    expect(catalog[':mbta:'].secret).toBe(true);
    expect(catalog[':joco:'].secret).toBe(false);
  });

  it('does not mistake inherited object members for emoji', () => {
    // Post text is looked up word by word; on an ordinary object these would be truthy.
    const catalog = buildCustomEmojiCatalog(data, server);
    for (const word of ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__']) {
      expect(catalog[word]).toBeUndefined();
    }
  });

  it('skips an emoji whose image URL cannot be resolved', () => {
    const catalog = buildCustomEmojiCatalog(data, '');
    expect(Object.keys(catalog)).toEqual([]);
  });
});

describe('reactionAccessibilityName', () => {
  const catalog = buildCustomEmojiCatalog(
    [{reaction: ':hottub:', name: 'hot tub', imageURL: '/img/emoji/small/hottub.png'}],
    'https://twitarr.example',
  );

  it('reads a custom emoji by its name, not its token', () => {
    expect(reactionAccessibilityName(catalog, ':hottub:')).toBe('hot tub');
  });

  it('leaves Unicode emoji and unknown tokens as they are', () => {
    expect(reactionAccessibilityName(catalog, '👍')).toBe('👍');
    expect(reactionAccessibilityName(catalog, ':unknown:')).toBe(':unknown:');
    expect(reactionAccessibilityName(catalog, 'constructor')).toBe('constructor');
  });
});
