import React, {useCallback, useRef} from 'react';
import {RefreshControlProps, View} from 'react-native';

import {type TConversationListV2RefObject} from '#src/Components/Lists/ConversationListV2';
import {ConversationListV2} from '#src/Components/Lists/ConversationListV2';
import {LabelDivider} from '#src/Components/Lists/Dividers/LabelDivider';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {TimeDivider} from '#src/Components/Lists/Dividers/TimeDivider';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {ChatFlatListHeader} from '#src/Components/Lists/Headers/ChatFlatListHeader';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';
import {FezPostListItem} from '#src/Components/Lists/Items/FezPostListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useTime} from '#src/Context/Contexts/TimeContext';
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';

interface FezConversationListV2Props {
  fez: FezData;
  fezPostData: FezPostData[];
  listRef: TConversationListV2RefObject;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  initialScrollIndex?: number;
  /** When provided (e.g. from list cache), used for "New" divider instead of fez.members.readCount. */
  initialReadCount?: number;
  /** When provided, day dividers are only shown when this is > 2. Omit to always show dividers. */
  postDayCount?: number;
  /** Callback fired once the list has reached its initial scroll position. */
  onReadyToShow?: () => void;
}

/**
 * V2 fez conversation list. Wraps ConversationListV2 with fez-specific rendering.
 * Used for Seamail, LFG, and PersonalEvent chat screens.
 *
 * Key differences from ChatFlatList (V1):
 * - Configurable `alignItemsAtEnd` based on whether the chat is fully read.
 * - Exposes `onReadyToShow` to the parent screen for overlay control.
 * - Proper footer with `LoadingNextFooter` when paginating forward.
 * - Uses `paginator.start` for accurate "New" divider placement.
 */
export const FezConversationListV2 = ({
  fez,
  fezPostData,
  listRef,
  refreshControl,
  handleLoadNext,
  handleLoadPrevious,
  hasPreviousPage,
  hasNextPage,
  initialScrollIndex,
  initialReadCount,
  postDayCount,
  onReadyToShow,
}: FezConversationListV2Props) => {
  const {commonStyles} = useStyles();
  const {getAdjustedMoment} = useTime();

  const showDayDividers = postDayCount === undefined || postDayCount > 2;

  /** Show a TimeDivider above the first item and at each day boundary. */
  const showTimeDivider = useCallback(
    (index: number) => {
      if (index === 0) {
        return true;
      }
      const currentKey = getAdjustedMoment(fezPostData[index].timestamp).format('YYYY-MM-DD');
      const prevKey = getAdjustedMoment(fezPostData[index - 1].timestamp).format('YYYY-MM-DD');
      return currentKey !== prevKey;
    },
    [fezPostData, getAdjustedMoment],
  );

  // Lock initial read state on mount. Use initialReadCount when provided (e.g. from list cache)
  // so the "New" divider shows correctly on subsequent visits when detail cache is already marked read.
  const effectiveReadCount = initialReadCount ?? fez.members?.readCount ?? 0;
  const initialReadStateRef = useRef({
    readCount: effectiveReadCount,
    paginatorStart: fez.members?.paginator?.start ?? 0,
  });

  // alignItemsAtEnd is a layout concern — once set false (unreads detected) it must
  // not flip back to true or the list layout will jump. Locked via one-way ref.
  const alignAtEndRef = useRef(fez.members ? effectiveReadCount === fez.members.postCount : true);
  if (alignAtEndRef.current && fez.members && effectiveReadCount !== fez.members.postCount) {
    alignAtEndRef.current = false;
  }

  // Divider visibility is dynamic: effectiveReadCount uses the frozen initialReadCount
  // (stable until resetInitialReadCount), so this naturally shows the divider for
  // unreads and clears it when the user posts (which resets initialReadCount).
  const isFullyRead = fez.members ? effectiveReadCount === fez.members.postCount : true;

  const newDividerIndex = (() => {
    if (isFullyRead) return undefined;
    const {readCount, paginatorStart} = initialReadStateRef.current;
    const idx = readCount - paginatorStart;
    return idx >= 0 && idx < fezPostData.length ? idx : undefined;
  })();

  const showNewDivider = useCallback(
    (index: number) => {
      if (isFullyRead) {
        return false;
      }
      const {readCount, paginatorStart} = initialReadStateRef.current;
      return readCount - paginatorStart === index;
    },
    [isFullyRead],
  );

  const renderItem = useCallback(
    ({item, index}: {item: FezPostData; index: number}) => {
      return (
        <View>
          {showDayDividers && showTimeDivider(index) && (
            <TimeDivider label={getAdjustedMoment(item.timestamp).format('dddd MMM Do')} />
          )}
          {showNewDivider(index) && <LabelDivider label={'New'} />}
          <FezPostListItem fezPost={item} index={index} fez={fez} />
        </View>
      );
    },
    [fez, showDayDividers, showNewDivider, showTimeDivider, getAdjustedMoment],
  );

  const renderSeparator = useCallback(() => <SpaceDivider />, []);

  const renderListHeader = useCallback(() => {
    if (hasPreviousPage) {
      return <LoadingPreviousHeader />;
    }
    return <ChatFlatListHeader />;
  }, [hasPreviousPage]);

  const renderListFooter = useCallback(() => {
    if (hasNextPage) {
      return <LoadingNextFooter />;
    }
    return <SpaceDivider />;
  }, [hasNextPage]);

  const keyExtractor = useCallback((item: FezPostData) => item.postID.toString(), []);

  return (
    <ConversationListV2<FezPostData>
      listRef={listRef}
      data={fezPostData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={renderListFooter}
      ItemSeparatorComponent={renderSeparator}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      initialScrollIndex={initialScrollIndex}
      alignItemsAtEnd={alignAtEndRef.current}
      maintainScrollAtEnd={true}
      estimatedItemSize={100}
      onReadyToShow={onReadyToShow}
      newDividerIndex={newDividerIndex}
      // Style is here rather than in the renderItem because the padding we use is
      // also needed for the dividers. It could be added to the divider function as
      // well but this is slightly simpler and covers cases I am not remembering.
      style={commonStyles.paddingHorizontalSmall}
    />
  );
};
