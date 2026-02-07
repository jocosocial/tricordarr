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
import {KaraokeSongData} from '#src/Structs/ControllerStructs';

/** Display item: performance row (latest list) or full song (search/favorites). */
export type KaraokeSongListItemData =
  | {songID?: string; isFavorite?: boolean; songName: string; artist: string; performers?: string; time?: string}
  | KaraokeSongData;

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
  /** Show favorite button (only when songID/isFavorite available). */
  showFavoriteButton?: boolean;
  /** Optional press handler (e.g. navigate to log screen). */
  onPress?: () => void;
}

const KaraokeSongListItemInner = ({item, showFavoriteButton = false, onPress}: KaraokeSongListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const queryClient = useQueryClient();
  const favoriteMutation = useKaraokeFavoriteMutation();
  const {refreshing, setRefreshing} = useRefresh({});

  const songID = 'songID' in item ? item.songID : undefined;
  const isFavorite = 'isFavorite' in item ? item.isFavorite : undefined;
  const hasFavoriteData = songID !== undefined && isFavorite !== undefined;

  const onFavoritePress = useCallback(() => {
    if (!songID || isFavorite === undefined) return;
    setRefreshing(true);
    favoriteMutation.mutate(
      {songID, action: isFavorite ? 'unfavorite' : 'favorite'},
      {
        onSuccess: async () => {
          const {KaraokeSongData: K} = await import('#src/Structs/ControllerStructs');
          const keys = K.getCacheKeys(songID);
          await Promise.all(keys.map(key => queryClient.invalidateQueries({queryKey: key})));
        },
        onSettled: () => setRefreshing(false),
      },
    );
  }, [songID, isFavorite, favoriteMutation, queryClient, setRefreshing]);

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

  const rightContent =
    showFavoriteButton && hasFavoriteData ? (
      <View style={styles.rightContainer}>
        {refreshing && <ActivityIndicator />}
        {!refreshing && (
          <TouchableOpacity onPress={onFavoritePress}>
            {isFavorite ? (
              <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />
            ) : (
              <AppIcon icon={AppIcons.toggleFavorite} />
            )}
          </TouchableOpacity>
        )}
      </View>
    ) : null;

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
      right={rightContent ? () => rightContent : undefined}
    />
  );
};

export const KaraokeSongListItem = memo(KaraokeSongListItemInner);
