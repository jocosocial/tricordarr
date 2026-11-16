import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';

import {
  PostReactionContextType,
  usePendingReaction,
  usePostReactionContext,
} from '#src/Context/Contexts/PostReactionContext';
import {PostReactionProvider} from '#src/Context/Providers/PostReactionProvider';
import {ReactionTarget} from '#src/Libraries/Reactions/ReactionActions';
import {FezData, FezPostData, PostData, ReactionData, UserHeader} from '#src/Structs/ControllerStructs';

const mockApiPost = jest.fn();
const mockSetSnackbarPayload = jest.fn();
const mockUpdateForumPostReactions = jest.fn();
const mockUpdateFezPostReactions = jest.fn();

// The real mutation runs, against a fake network, so these tests cover how the provider and
// react-query behave together when several requests overlap.
jest.mock('#src/Context/Contexts/SwiftarrQueryClientContext', () => ({
  useSwiftarrQueryClient: () => ({apiPost: mockApiPost}),
}));
jest.mock('#src/Context/Contexts/SnackbarContext', () => ({
  useSnackbar: () => ({setSnackbarPayload: mockSetSnackbarPayload}),
}));
jest.mock('#src/Libraries/Logger', () => ({
  createLogger: () => ({debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn()}),
}));
jest.mock('#src/Hooks/Forum/useForumCacheReducer', () => ({
  useForumCacheReducer: () => ({updatePostReactions: mockUpdateForumPostReactions}),
}));
jest.mock('#src/Hooks/Fez/useFezCacheReducer', () => ({
  useFezCacheReducer: () => ({updatePostReactions: mockUpdateFezPostReactions}),
}));

const heidi = {userID: 'heidi-id', username: 'heidi'} as UserHeader;
const james = {userID: 'james-id', username: 'james'} as UserHeader;

const forumPost = (postID: number) => ({postID, author: heidi, text: 'post'}) as PostData;
const forumTarget = (postID: number): ReactionTarget => ({
  kind: 'forumPost',
  post: forumPost(postID),
  forumID: 'forum-id',
});
const fezTarget: ReactionTarget = {
  kind: 'fezPost',
  post: {postID: 7, author: heidi, text: 'chat', timestamp: ''} as FezPostData,
  fez: {fezID: 'fez-id'} as FezData,
};

/** A request the test settles by hand, standing in for a slow connection. */
const deferred = () => {
  let resolve!: (value: unknown) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
};

/** Lets settled requests reach the provider's handlers. */
const flush = () => act(async () => {});

describe('PostReactionProvider', () => {
  let context: PostReactionContextType;
  let pending: {post1?: string; post2?: string; fez?: string};

  const Consumer = () => {
    context = usePostReactionContext();
    pending = {
      post1: usePendingReaction('forumPost', 1),
      post2: usePendingReaction('forumPost', 2),
      fez: usePendingReaction('fezPost', 7),
    };
    return null;
  };

  let queryClient: QueryClient;
  let renderer: ReactTestRenderer;

  const render = () => {
    queryClient = new QueryClient({defaultOptions: {mutations: {retry: false}}});
    act(() => {
      renderer = create(
        <QueryClientProvider client={queryClient}>
          <PostReactionProvider>
            <Consumer />
          </PostReactionProvider>
        </QueryClientProvider>,
      );
    });
  };

  /**
   * Starts a request as a tap would. sendReaction returns a promise for its own bookkeeping; the
   * braces keep act from treating this as an async scope that the test never awaits.
   */
  const send = (...args: Parameters<PostReactionContextType['sendReaction']>) =>
    act(() => {
      context.sendReaction(...args);
    });

  beforeEach(() => {
    jest.clearAllMocks();
    render();
  });

  // react-query keeps a finished mutation for five minutes on a timer, which would hold Jest open.
  afterEach(() => {
    act(() => renderer.unmount());
    queryClient.clear();
  });

  it('marks the post pending while the request runs, then updates the forum caches', async () => {
    const request = deferred();
    mockApiPost.mockReturnValueOnce(request.promise);

    send(forumTarget(1), '👍', 'create');
    await flush();

    expect(mockApiPost).toHaveBeenCalledWith('/forum/post/1/react', {reaction: '👍'});
    expect(pending.post1).toBe('👍');
    expect(pending.post2).toBeUndefined();
    expect(mockUpdateForumPostReactions).not.toHaveBeenCalled();

    const updated = {...forumPost(1), reactions: [{reaction: '👍', users: [james]}]};
    request.resolve({data: updated});
    await flush();

    expect(mockUpdateForumPostReactions).toHaveBeenCalledWith(updated, 'forum-id');
    expect(pending.post1).toBeUndefined();
  });

  it('removes through the unreact endpoint and updates the chat cache for a chat post', async () => {
    const reactions: ReactionData[] = [];
    mockApiPost.mockResolvedValueOnce({data: {postID: 7, reactions, reactionRevision: 4}});

    send(fezTarget, ':arr:', 'delete');
    await flush();

    expect(mockApiPost).toHaveBeenCalledWith('/fez/post/7/unreact', {reaction: ':arr:'});
    expect(mockUpdateFezPostReactions).toHaveBeenCalledWith('fez-id', 7, reactions, 4);
    expect(mockUpdateForumPostReactions).not.toHaveBeenCalled();
    expect(pending.fez).toBeUndefined();
  });

  it('clears the pending state and reports the error when the request fails', async () => {
    const request = deferred();
    mockApiPost.mockReturnValueOnce(request.promise);

    send(forumTarget(1), '👍', 'create');
    await flush();
    expect(pending.post1).toBe('👍');

    request.reject(new Error('ship wifi'));
    await flush();

    // Otherwise the post's badges would spin, and refuse taps, for good.
    expect(pending.post1).toBeUndefined();
    expect(mockUpdateForumPostReactions).not.toHaveBeenCalled();
    expect(mockSetSnackbarPayload).toHaveBeenCalledWith(expect.objectContaining({messageType: 'error'}));

    // And the post accepts a new request afterwards.
    mockApiPost.mockResolvedValueOnce({data: forumPost(1)});
    send(forumTarget(1), '👍', 'create');
    await flush();
    expect(mockApiPost).toHaveBeenCalledTimes(2);
  });

  it('ignores a second request for a post that already has one in flight', async () => {
    const request = deferred();
    mockApiPost.mockReturnValueOnce(request.promise);

    send(forumTarget(1), '👍', 'create');
    send(forumTarget(1), '👍', 'delete');
    send(forumTarget(1), '🎉', 'create');
    await flush();

    expect(mockApiPost).toHaveBeenCalledTimes(1);
    expect(pending.post1).toBe('👍');

    request.resolve({data: forumPost(1)});
    await flush();
  });

  it('handles requests for different posts at once, whichever order they finish in', async () => {
    const first = deferred();
    const second = deferred();
    mockApiPost.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    send(forumTarget(1), '👍', 'create');
    send(forumTarget(2), '🎉', 'create');
    await flush();
    expect(pending).toEqual({post1: '👍', post2: '🎉', fez: undefined});

    // The later request answers first. Each post must still get its own update.
    second.resolve({data: forumPost(2)});
    await flush();
    expect(pending).toEqual({post1: '👍', post2: undefined, fez: undefined});
    expect(mockUpdateForumPostReactions).toHaveBeenCalledTimes(1);
    expect(mockUpdateForumPostReactions).toHaveBeenLastCalledWith(forumPost(2), 'forum-id');

    first.resolve({data: forumPost(1)});
    await flush();
    expect(pending).toEqual({post1: undefined, post2: undefined, fez: undefined});
    expect(mockUpdateForumPostReactions).toHaveBeenCalledTimes(2);
    expect(mockUpdateForumPostReactions).toHaveBeenLastCalledWith(forumPost(1), 'forum-id');
  });
});
