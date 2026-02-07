import {type FlashListRef} from '@shopify/flash-list';
import React, {forwardRef, useCallback} from 'react';
import {RefreshControlProps} from 'react-native';
import {Divider} from 'react-native-paper';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {NoResultsFooter} from '#src/Components/Lists/Footers/NoResultsFooter';
import {KaraokeSongListItem} from '#src/Components/Lists/Items/KaraokeSongListItem';
import type {KaraokeSongListItemData} from '#src/Components/Lists/Items/KaraokeSongListItem';
import {KaraokeListItemSwipeable} from '#src/Components/Swipeables/KaraokeListItemSwipeable';
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
  showEmptyFooter?: boolean;
}

const KaraokeSongListInner = (
  {
    items,
    swipeableEnabled = false,
    refreshControl,
    hasNextPage,
    handleLoadNext,
    listHeader,
    showEmptyFooter = true,
  }: KaraokeSongListProps,
  ref: React.ForwardedRef<FlashListRef<KaraokeSongListItem>>,
) => {
  const getListSeparator = useCallback(() => <Divider bold={true} />, []);

  const renderItem = useCallback(
    ({item}: {item: KaraokeSongListItem}) => {
      const listItem = <KaraokeSongListItem item={item} />;
      if (swipeableEnabled) {
        return (
          <KaraokeListItemSwipeable song={item} showLogButton={true}>
            {listItem}
          </KaraokeListItemSwipeable>
        );
      }
      return listItem;
    },
    [swipeableEnabled],
  );

  const keyExtractor = useCallback((item: KaraokeSongListItem) => {
    if (isKaraokeSongData(item)) return item.songID;
    const p = item as KaraokePerformedSongsData;
    return `${p.songID}-${p.time}-${p.performers}`;
  }, []);

  const getListFooter = useCallback(() => {
    if (hasNextPage) return <LoadingNextFooter />;
    if (items.length > 0) return <EndResultsFooter />;
    if (items.length === 0 && showEmptyFooter) return <NoResultsFooter />;
    return null;
  }, [items.length, hasNextPage, showEmptyFooter]);

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

export const KaraokeSongList = forwardRef(KaraokeSongListInner);
