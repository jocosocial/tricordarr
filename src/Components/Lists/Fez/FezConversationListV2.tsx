import moment from 'moment-timezone';
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
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useTimeZone} from '#src/Hooks/useTimeZone';
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
  onReadyToShow,
}: FezConversationListV2Props) => {
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  const {tzAtTime} = useTimeZone();

  /**
   * Return a moment adjusted for lateDayFlip. When enabled, subtracts 3 hours
   * so that posts between midnight and 3:00 AM are grouped with the previous day.
   */
  const getAdjustedMoment = useCallback(
    (timestamp: string) => {
      const date = new Date(timestamp);
      const tz = tzAtTime(date);
      let m = moment(timestamp).tz(tz);
      if (appConfig.schedule.enableLateDayFlip) {
        m = m.subtract(3, 'hours');
      }
      return m;
    },
    [appConfig.schedule.enableLateDayFlip, tzAtTime],
  );

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

  // Lock initial read state on mount. The server's readCount lags behind postCount
  // when new messages arrive via socket, which causes oscillation. Locking prevents:
  // - alignItemsAtEnd layout thrash that breaks maintainScrollAtEnd
  // - "New" divider jumping to a new position on every incoming message
  const initialReadStateRef = useRef({
    isFullyRead: fez.members ? fez.members.readCount === fez.members.postCount : true,
    readCount: fez.members?.readCount ?? 0,
    paginatorStart: fez.members?.paginator?.start ?? 0,
  });

  // Compute the divider index once from the locked read state for the scroll button.
  // Only set when the divider is within the loaded data range.
  const newDividerIndex = (() => {
    const {isFullyRead, readCount, paginatorStart} = initialReadStateRef.current;
    if (isFullyRead) return undefined;
    const idx = readCount - paginatorStart;
    return idx >= 0 && idx < fezPostData.length ? idx : undefined;
  })();

  const showNewDivider = useCallback((index: number) => {
    // Use the locked initial read state so the divider position is stable.
    // If the chat was fully read when opened, never show a divider — the user
    // is actively watching and doesn't need a "New" marker.
    const {isFullyRead, readCount, paginatorStart} = initialReadStateRef.current;
    if (isFullyRead) {
      return false;
    }
    return readCount - paginatorStart === index;
  }, []);

  const renderItem = useCallback(
    ({item, index}: {item: FezPostData; index: number}) => {
      return (
        <View>
          {showTimeDivider(index) && <TimeDivider label={getAdjustedMoment(item.timestamp).format('dddd MMM Do')} />}
          {showNewDivider(index) && <LabelDivider label={'New'} />}
          <FezPostListItem fezPost={item} index={index} fez={fez} />
        </View>
      );
    },
    [fez, showNewDivider, showTimeDivider, getAdjustedMoment],
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
      enableScrollButton={true}
      initialScrollIndex={initialScrollIndex}
      alignItemsAtEnd={initialReadStateRef.current.isFullyRead}
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
