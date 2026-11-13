import React, {forwardRef, useCallback} from 'react';
import {FlatList, RefreshControlProps} from 'react-native';

import {AppFlatList} from '#src/Components/Lists/AppFlatList';
import {KaraokeSongListItem} from '#src/Components/Lists/Items/KaraokeSongListItem';
import type {KaraokeSongListItemData} from '#src/Components/Lists/Items/KaraokeSongListItem';
import {useAppFlashList} from '#src/Hooks/useAppFlashList';
import {KaraokePerformedSongsData, KaraokeSongData} from '#src/Structs/ControllerStructs';

export type KaraokeSongListItem = KaraokeSongListItemData;

function isKaraokeSongData(item: KaraokeSongListItem): item is KaraokeSongData {
  return 'performances' in item;
}

interface KaraokeSongListProps {
  items: KaraokeSongListItem[];
  /** Wrap items in swipeable (Favorite + Log if karaokemanager). */
  swipeableEnabled?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  hasNextPage?: boolean;
  handleLoadNext?: () => void;
  listHeader?: React.ComponentType<any>;
}

const KaraokeSongListInner = (
  {items, swipeableEnabled = false, refreshControl, hasNextPage, handleLoadNext, listHeader}: KaraokeSongListProps,
  ref: React.ForwardedRef<FlatList<KaraokeSongListItem>>,
) => {
  const {getListSeparator, getListFooter} = useAppFlashList({data: items, hasNextPage});

  const renderItem = useCallback(
    ({item}: {item: KaraokeSongListItem}) => <KaraokeSongListItem item={item} swipeableEnabled={swipeableEnabled} />,
    [swipeableEnabled],
  );

  const keyExtractor = useCallback((item: KaraokeSongListItem) => {
    if (isKaraokeSongData(item)) return item.songID;
    const p = item as KaraokePerformedSongsData;
    return `${p.songID}-${p.time}-${p.performers}`;
  }, []);

  return (
    <AppFlatList<KaraokeSongListItem>
      ref={ref}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      renderItemSeparator={getListSeparator}
      renderListHeader={listHeader}
      renderListFooter={getListFooter}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
    />
  );
};

export const KaraokeSongList = forwardRef<FlatList<KaraokeSongListItem>, KaraokeSongListProps>(KaraokeSongListInner);
