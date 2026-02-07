import {useQueryClient} from '@tanstack/react-query';
import {format} from 'date-fns';
import React, {memo, useCallback} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator, List} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useKaraokeFavoriteMutation} from '#src/Queries/Karaoke/KaraokeMutations';
import {KaraokePerformedSongsData, KaraokeSongData} from '#src/Structs/ControllerStructs';

/** Display item: performance row (latest list) or full song (search/favorites). */
export type KaraokeSongListItemData = KaraokePerformedSongsData | KaraokeSongData;

function formatPerformanceTime(isoTime: string): string {
  try {
    return format(new Date(isoTime), 'EEE MMM dd h:mm a');
  } catch {
    return isoTime;
  }
}

interface KaraokeSongListItemProps {
  /** Song or performance data. */
  item: KaraokeSongListItemData;
  /** Optional press handler (e.g. navigate to log screen). */
  onPress?: () => void;
}

const KaraokeSongListItemInner = ({item, onPress}: KaraokeSongListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const queryClient = useQueryClient();
  const favoriteMutation = useKaraokeFavoriteMutation();
  const {refreshing, setRefreshing} = useRefresh({});

  const onFavoritePress = useCallback(() => {
    if (!item.songID || item.isFavorite === undefined) return;
    setRefreshing(true);
    favoriteMutation.mutate(
      {songID: item.songID, action: item.isFavorite ? 'unfavorite' : 'favorite'},
      {
        onSuccess: async () => {
          const {KaraokeSongData: K} = await import('#src/Structs/ControllerStructs');
          const keys = K.getCacheKeys(item.songID);
          await Promise.all(keys.map(key => queryClient.invalidateQueries({queryKey: key})));
        },
        onSettled: () => setRefreshing(false),
      },
    );
  }, [item, favoriteMutation, queryClient, setRefreshing]);

  const title = item.songName;
  const performerLine =
    'performers' in item && item.performers != null && 'time' in item && item.time != null
      ? `Performed by ${item.performers} on ${formatPerformanceTime(item.time)}`
      : 'performances' in item && item.performances?.length
        ? (() => {
            const p = item.performances[0];
            return `Performed by ${p.performers} on ${formatPerformanceTime(p.time)}`;
          })()
        : null;

  const styles = StyleSheet.create({
    item: {
      backgroundColor: theme.colors.background,
      ...commonStyles.paddingHorizontalSmall,
    },
    content: {
      ...commonStyles.paddingLeftZero,
    },
    title: {
      ...commonStyles.onBackground,
      fontWeight: 'bold',
    },
    text: {
      ...commonStyles.onBackground,
    },
    performerLine: {
      fontStyle: 'italic',
    },
    rightContainer: {
      ...commonStyles.marginLeftSmall,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
  });

  const description =
    performerLine != null ? (
      <View>
        <Text style={styles.text}>{item.artist}</Text>
        <Text style={[styles.text, styles.performerLine]}>{performerLine}</Text>
      </View>
    ) : (
      item.artist
    );

  const rightContent = useCallback(
    () => (
      <View style={styles.rightContainer}>
        {refreshing && <ActivityIndicator />}
        {!refreshing && (
          <TouchableOpacity onPress={onFavoritePress}>
            {item.isFavorite ? (
              <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />
            ) : (
              <AppIcon icon={AppIcons.toggleFavorite} />
            )}
          </TouchableOpacity>
        )}
      </View>
    ),
    [item, refreshing, onFavoritePress, styles.rightContainer, theme.colors.twitarrYellow],
  );

  return (
    <List.Item
      contentStyle={styles.content}
      style={styles.item}
      title={title}
      titleNumberOfLines={0}
      description={description}
      descriptionStyle={styles.text}
      titleStyle={styles.title}
      onPress={onPress}
      right={rightContent}
    />
  );
};

export const KaraokeSongListItem = memo(KaraokeSongListItemInner);
