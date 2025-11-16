import {useQueryClient} from '@tanstack/react-query';
import React, {PropsWithChildren, useCallback, useState} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useForumPinMutation} from '#src/Queries/Forum/ForumThreadPinMutations';
import {useForumThreadQuery} from '#src/Queries/Forum/ForumThreadQueries';
import {useForumRelationMutation} from '#src/Queries/Forum/ForumThreadRelationMutations';
import {ForumListData} from '#src/Structs/ControllerStructs';
import {useAppTheme} from '#src/Styles/Theme';

interface ForumThreadListItemSwipeableProps extends PropsWithChildren {
  forumListData: ForumListData;
  categoryID?: string;
  enabled?: boolean;
}

export const ForumThreadListItemSwipeable = (props: ForumThreadListItemSwipeableProps) => {
  const theme = useAppTheme();
  const relationMutation = useForumRelationMutation();
  const queryClient = useQueryClient();
  const [muteRefreshing, setMuteRefreshing] = useState(false);
  const [favoriteRefreshing, setFavoriteRefreshing] = useState(false);
  const [readRefreshing, setReadRefreshing] = useState(false);
  const [pinRefreshing, setPinRefreshing] = useState(false);
  const commonNavigation = useCommonStack();
  const eventID = props.forumListData.eventID;
  const {hasModerator} = usePrivilege();
  const pinMutation = useForumPinMutation();
  const {refetch} = useForumThreadQuery(props.forumListData.forumID, undefined, {enabled: false});

  const invalidationQueryKeys = ForumListData.getCacheKeys(props.categoryID, props.forumListData.forumID);

  const handleMarkAsRead = useCallback(
    async (swipeable: SwipeableMethods) => {
      // Reset first. Improves response time.
      swipeable.reset();
      setReadRefreshing(true);
      // We need to "refetch" (which triggers markAsRead) before we then go invalidate
      // the other keys. This had an issue where marking a favorite forum as read would
      // not update the favorites list.
      await refetch();
      const invalidations = invalidationQueryKeys.map(key => {
        return queryClient.invalidateQueries({queryKey: key});
      });
      await Promise.all(invalidations);
      setReadRefreshing(false);
    },
    [queryClient, invalidationQueryKeys, refetch],
  );

  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      setFavoriteRefreshing(true);
      relationMutation.mutate(
        {
          forumID: props.forumListData.forumID,
          relationType: 'favorite',
          action: props.forumListData.isFavorite ? 'delete' : 'create',
        },
        {
          onSuccess: async () => {
            const invalidations = invalidationQueryKeys.map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            });
            await Promise.all(invalidations);
          },
          onSettled: () => {
            setFavoriteRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [relationMutation, props.forumListData.forumID, props.forumListData.isFavorite, invalidationQueryKeys, queryClient],
  );

  const handleMute = useCallback(
    (swipeable: SwipeableMethods) => {
      setMuteRefreshing(true);
      relationMutation.mutate(
        {
          forumID: props.forumListData.forumID,
          relationType: 'mute',
          action: props.forumListData.isMuted ? 'delete' : 'create',
        },
        {
          onSuccess: async () => {
            const invalidations = invalidationQueryKeys.map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            });
            await Promise.all(invalidations);
          },
          onSettled: () => {
            setMuteRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [relationMutation, props.forumListData.forumID, props.forumListData.isMuted, invalidationQueryKeys, queryClient],
  );

  const handlePin = (swipeable: SwipeableMethods) => {
    setPinRefreshing(true);
    pinMutation.mutate(
      {
        forumID: props.forumListData.forumID,
        action: props.forumListData.isPinned ? 'unpin' : 'pin',
      },
      {
        onSuccess: async () => {
          const invalidations = invalidationQueryKeys.map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          await Promise.all([invalidations].flat());
        },
        onSettled: () => {
          setPinRefreshing(false);
          swipeable.reset();
        },
      },
    );
  };

  const renderLeftPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <>
        {eventID && (
          <SwipeableButton
            text={'Event'}
            iconName={AppIcons.events}
            onPress={() => {
              swipeable.reset();
              commonNavigation.push(CommonStackComponents.eventScreen, {
                eventID: eventID,
              });
            }}
            style={{backgroundColor: theme.colors.twitarrNeutralButton}}
            textStyle={{color: theme.colors.onTwitarrNeutralButton}}
            iconColor={theme.colors.onTwitarrNeutralButton}
          />
        )}
        {hasModerator && props.categoryID && (
          <SwipeableButton
            text={props.forumListData.isPinned ? 'Unpin' : 'Pin'}
            refreshing={pinRefreshing}
            onPress={() => handlePin(swipeable)}
            iconName={AppIcons.moderator}
            style={{backgroundColor: theme.colors.elevation.level1}}
          />
        )}
      </>
    );
  };

  const renderRightPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <>
        <SwipeableButton
          text={props.forumListData.isMuted ? 'Unmute' : 'Mute'}
          iconName={props.forumListData.isMuted ? AppIcons.unmute : AppIcons.mute}
          style={{backgroundColor: theme.colors.elevation.level2}}
          onPress={() => handleMute(swipeable)}
          refreshing={muteRefreshing}
          disabled={props.forumListData.isFavorite}
        />
        <SwipeableButton
          text={props.forumListData.isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={props.forumListData.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
          onPress={() => handleFavorite(swipeable)}
          refreshing={favoriteRefreshing}
          style={{backgroundColor: theme.colors.elevation.level1}}
          disabled={props.forumListData.isMuted}
        />
        <SwipeableButton
          // Ehhhhhh
          text={'Mark\n   as\nRead'}
          iconName={AppIcons.check}
          onPress={() => handleMarkAsRead(swipeable)}
          refreshing={readRefreshing}
          style={{backgroundColor: theme.colors.elevation.level3}}
        />
      </>
    );
  };

  return (
    <BaseSwipeable enabled={props.enabled} renderLeftPanel={renderLeftPanel} renderRightPanel={renderRightPanel}>
      {props.children}
    </BaseSwipeable>
  );
};
