import React, {useCallback, useState} from 'react';
import {RefreshControlProps, View} from 'react-native';

import {ChatList, type TChatListRefObject} from '#src/Components/Lists/ChatList';
import {LabelDivider} from '#src/Components/Lists/Dividers/LabelDivider';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {TimeDivider} from '#src/Components/Lists/Dividers/TimeDivider';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {ChatFlatListHeader} from '#src/Components/Lists/Headers/ChatFlatListHeader';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';
import {FezPostListItem} from '#src/Components/Lists/Items/Fez/FezPostListItem';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useTime} from '#src/Context/Contexts/TimeContext';
import {useStickyTrue} from '#src/Hooks/useStickyTrue';
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';

interface FezConversationListV2Props {
  fez: FezData;
  fezPostData: FezPostData[];
  listRef: TChatListRefObject<FezPostData>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  initialScrollIndex?: number;
  /** When provided (e.g. from list cache), used for "New" divider instead of fez.members.readCount. */
  initialReadCount?: number;
  /**
   * When provided, day dividers are only shown when this is > 2 or the chat has more pages than are
   * loaded. Omit to always show dividers.
   */
  postDayCount?: number;
  /** Callback fired once the list has reached its initial scroll position. */
  onReadyToShow?: () => void;
}

/**
 * Fez conversation list. Wraps ChatList with fez-specific rendering (day dividers, the "New"
 * divider, post items). Used for Seamail, LFG, and PersonalEvent chat screens.
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
  const {currentUserID} = useSession();

  // postDayCount only covers the loaded posts. Loading a page could cross the threshold and add every
  // day divider at once, moving the posts on screen, so a chat with unloaded pages always shows them.
  // One-way, so that loading the last page does not take them away again.
  const showDayDividers = useStickyTrue(
    postDayCount === undefined || postDayCount > 2 || !!hasPreviousPage || !!hasNextPage,
  );

  /** Whether two neighboring posts fall on different days. */
  const isDayBoundary = useCallback(
    (leading: FezPostData, trailing: FezPostData) =>
      getAdjustedMoment(leading.timestamp).format('YYYY-MM-DD') !==
      getAdjustedMoment(trailing.timestamp).format('YYYY-MM-DD'),
    [getAdjustedMoment],
  );

  // Lock initial read state, refreshed only when initialReadCount actually changes value
  // (e.g. after resetInitialReadCount runs following a send). Use initialReadCount when
  // provided (e.g. from list cache) so the "New" divider shows correctly on subsequent
  // visits when detail cache is already marked read.
  const effectiveReadCount = initialReadCount ?? fez.members?.readCount ?? 0;
  const [frozenReadCount, setFrozenReadCount] = useState(effectiveReadCount);
  // The frozen read count must stay frozen across ordinary re-renders (new posts arriving,
  // props changing shape, etc.) so the divider doesn't drift while the user is reading —
  // but it also must not stay frozen forever, or a stale readCount pins the
  // "New" divider at the wrong index permanently once resetInitialReadCount changes
  // initialReadCount upstream (e.g. right after this user sends a post). A useEffect would
  // fix that only after an extra render (a visible flash of the divider in the wrong spot);
  // comparing against seenInitialReadCount during render — React's "adjust state while
  // rendering" pattern — re-seeds frozenReadCount before this render commits, and only on
  // renders where the prop actually changed. React re-runs the render immediately with the
  // new state, so children never see the stale value.
  const [seenInitialReadCount, setSeenInitialReadCount] = useState(initialReadCount);
  if (initialReadCount !== seenInitialReadCount) {
    setSeenInitialReadCount(initialReadCount);
    setFrozenReadCount(effectiveReadCount);
  }
  // The page start is deliberately NOT frozen. `fez` is the first loaded page, so its start drops
  // when an older page is prepended, and the divider's index in the flattened posts must shift by
  // the same amount. Freezing it left the divider a page early after loading older posts.
  const paginatorStart = fez.members?.paginator?.start ?? 0;

  // The anchor is a layout concern — once set false (unreads detected) it must
  // not flip back to true or the list layout will jump. Locked via a one-way latch.
  const alignAtEnd = !useStickyTrue(!!fez.members && effectiveReadCount !== fez.members.postCount);

  // Divider visibility is dynamic: effectiveReadCount uses the frozen initialReadCount
  // (stable until resetInitialReadCount), so this naturally shows the divider for
  // unreads and clears it when the user posts (which resets initialReadCount).
  const isFullyRead = fez.members ? effectiveReadCount === fez.members.postCount : true;

  const newDividerIndex = (() => {
    if (isFullyRead) return undefined;
    const idx = frozenReadCount - paginatorStart;
    return idx >= 0 && idx < fezPostData.length ? idx : undefined;
  })();

  const showNewDivider = useCallback(
    (index: number) => {
      if (isFullyRead) {
        return false;
      }
      return frozenReadCount - paginatorStart === index;
    },
    [frozenReadCount, isFullyRead, paginatorStart],
  );

  const renderItem = useCallback(
    ({item, index}: {item: FezPostData; index: number}) => {
      return (
        <View>
          {showDayDividers && index === 0 && !hasPreviousPage && (
            <TimeDivider label={getAdjustedMoment(item.timestamp).format('dddd MMM Do')} />
          )}
          {showNewDivider(index) && <LabelDivider label={'New'} />}
          <FezPostListItem fezPost={item} index={index} fez={fez} />
        </View>
      );
    },
    [fez, hasPreviousPage, showDayDividers, showNewDivider, getAdjustedMoment],
  );

  /**
   * Gap between posts, with the day divider at a day boundary. The divider is here rather than in the
   * later post because that post may be the oldest one loaded: its divider would come or go when an
   * older page arrives, and FlashList only holds the top of a cell still, so the text would move.
   */
  const renderSeparator = useCallback(
    ({leadingItem, trailingItem}: {leadingItem: FezPostData; trailingItem: FezPostData}) => (
      <View>
        <SpaceDivider />
        {showDayDividers && isDayBoundary(leadingItem, trailingItem) && (
          <TimeDivider label={getAdjustedMoment(trailingItem.timestamp).format('dddd MMM Do')} />
        )}
      </View>
    ),
    [getAdjustedMoment, isDayBoundary, showDayDividers],
  );

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
    // No spacer here: ChatList puts the gap below the last post inside the last cell.
    return null;
  }, [hasNextPage]);

  const keyExtractor = useCallback((item: FezPostData) => item.postID.toString(), []);

  /** Recycled cells are only reused for items that render the same chrome (the New divider). */
  const getItemType = useCallback(
    (item: FezPostData, index: number) => (showNewDivider(index) ? 'post-with-divider' : 'post'),
    [showNewDivider],
  );

  const isOwnItem = useCallback((item: FezPostData) => item.author.userID === currentUserID, [currentUserID]);

  return (
    <ChatList<FezPostData>
      listRef={listRef}
      data={fezPostData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={renderListFooter}
      ItemSeparatorComponent={renderSeparator}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      anchor={alignAtEnd ? 'end' : {index: initialScrollIndex ?? 0}}
      // Real-time chat: always follow new posts at the tail, even when the read state says there
      // are unreads and the list is anchored to the New divider instead of the end.
      followTail={true}
      isOwnItem={isOwnItem}
      onReadyToShow={onReadyToShow}
      newDividerIndex={newDividerIndex}
      // renderItem's "New" divider placement is driven by isFullyRead/frozenReadCount/paginatorStart,
      // which live outside `data`. FlashList's recycled cells only
      // redraw when `item`/`index` change or `extraData` changes identity, so without this
      // a cell that already rendered a divider keeps showing it forever — e.g. sending two
      // messages in a row left a stale "New" divider stuck above each one. Combine both
      // isFullyRead and the index so every visibility/position transition is distinguishable,
      // including two different "hidden" states that would otherwise both be `undefined`.
      extraData={`${isFullyRead}-${newDividerIndex}`}
      // Style is here rather than in the renderItem because the padding we use is
      // also needed for the dividers. It could be added to the divider function as
      // well but this is slightly simpler and covers cases I am not remembering.
      // On the content container, not the list, so the scroll bar stays on the screen edge.
      contentContainerStyle={commonStyles.paddingHorizontalSmall}
    />
  );
};
