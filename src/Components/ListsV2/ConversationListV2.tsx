import Animated, {useAnimatedRef} from 'react-native-reanimated';

import {AppListV2, ListMethods} from '#src/Components/ListsV2/AppListV2';
import {ScrollProvider} from '#src/Context/Providers/ScrollProvider';

interface Props<TItem> {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  listRef: ListRef;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  renderItem: ({item}: LegendListRenderItemProps<TItem>) => React.ReactNode;
  data: TItem[];
  onScrollThreshold?: (condition: boolean) => void;
  enableScrollButton?: boolean;
  keyExtractor: (item: TItem) => string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ItemSeparatorComponent?: RNFlatListSeparatorComponent<TItem>;
  initialScrollIndex?: number;
  style?: StyleProp<ViewStyle>;
  scrollButtonVerticalPosition?: FloatingScrollButtonVerticalPosition;
}

export const ConversationListV2 = () => {
  const flatListRef = useAnimatedRef<ListMethods>();

  return (
    <>
      {/* Custom scroll provider so that we can use the `onScroll` event in our custom List implementation */}
      <ScrollProvider onScroll={onScroll}>
        <AppListV2
          ref={flatListRef}
          data={convoState.items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          disableFullWindowScroll={true}
          disableVirtualization={true}
          style={animatedListStyle}
          // The extra two items account for the header and the footer components
          initialNumToRender={isNative ? 32 : 62}
          maxToRenderPerBatch={isWeb ? 32 : 62}
          keyboardDismissMode={'on-drag'}
          keyboardShouldPersistTaps={'handled'}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          removeClippedSubviews={false}
          sideBorders={false}
          onContentSizeChange={onContentSizeChange}
          onLayout={onListLayout}
          onStartReached={onStartReached}
          onScrollToIndexFailed={onScrollToIndexFailed}
          scrollEventThrottle={100}
          ListHeaderComponent={<MaybeLoader isLoading={convoState.isFetchingHistory} />}
        />
      </ScrollProvider>
      <Animated.View style={animatedStickyViewStyle}>
        {convoState.status === ConvoStatus.Disabled ? (
          <ChatDisabled />
        ) : blocked ? (
          footer
        ) : (
          <ConversationFooter convoState={convoState} hasAcceptOverride={hasAcceptOverride}>
            <MessageInput
              onSendMessage={onSendMessage}
              hasEmbed={!!embedUri}
              setEmbed={setEmbed}
              openEmojiPicker={onOpenEmojiPicker}>
              <MessageInputEmbed embedUri={embedUri} setEmbed={setEmbed} />
            </MessageInput>
          </ConversationFooter>
        )}
      </Animated.View>
    </>
  );
};
