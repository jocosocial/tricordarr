import {format} from 'date-fns';
import React, {memo, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {List} from 'react-native-paper';

import {KaraokeListItemSwipeable} from '#src/Components/Swipeables/KaraokeListItemSwipeable';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
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
  /** When true, wrap the row in KaraokeListItemSwipeable (Favorite; Log for karaokemanager). */
  swipeableEnabled?: boolean;
}

/**
 * FlashList row for karaoke songs and performances. Owns the swipeable
 * wrapper so KaraokeSongList renderItem stays a single component.
 */
const KaraokeSongListItemInner = ({item, onPress, swipeableEnabled = false}: KaraokeSongListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

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

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          ...commonStyles.onBackground,
          fontStyle: 'italic',
        },
      }),
    [commonStyles, theme],
  );

  const description =
    performerLine != null ? (
      <View>
        <Text style={styles.text}>{item.artist}</Text>
        <Text style={styles.performerLine}>{performerLine}</Text>
      </View>
    ) : (
      item.artist
    );

  const listItem = (
    <List.Item
      contentStyle={styles.content}
      style={styles.item}
      title={title}
      titleNumberOfLines={0}
      description={description}
      descriptionStyle={styles.text}
      titleStyle={styles.title}
      onPress={onPress}
    />
  );

  if (swipeableEnabled) {
    return (
      <KaraokeListItemSwipeable song={item} showLogButton={true}>
        {listItem}
      </KaraokeListItemSwipeable>
    );
  }

  return listItem;
};

export const KaraokeSongListItem = memo(KaraokeSongListItemInner);
