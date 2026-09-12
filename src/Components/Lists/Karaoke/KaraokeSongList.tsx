import {type FlashListRef} from '@shopify/flash-list';
import React, {forwardRef, useCallback} from 'react';
import {RefreshControlProps} from 'react-native';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
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
  showFavoriteButton?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  hasNextPage?: boolean;
  handleLoadNext?: () => void;
  listHeader?: React.ComponentType<any>;
}

const KaraokeSongListInner = (
  {items, swipeableEnabled = false, refreshControl, hasNextPage, handleLoadNext, listHeader}: KaraokeSongListProps,
  ref: React.ForwardedRef<FlashListRef<KaraokeSongListItem>>,
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
    <AppFlashList<KaraokeSongListItem>
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

export const KaraokeSongList = forwardRef<FlashListRef<KaraokeSongListItem>, KaraokeSongListProps>(
  KaraokeSongListInner,
);
