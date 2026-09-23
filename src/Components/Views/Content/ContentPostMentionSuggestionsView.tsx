import React, {FC, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {SuggestionsProvidedProps} from 'react-native-controlled-mentions';
import {ActivityIndicator} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {MenuScrollIndicator} from '#src/Components/Views/MenuScrollIndicator';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {UserMatchSort} from '#src/Enums/UserMatchSort';
import {useUserMatchQuery} from '#src/Queries/Users/UsersQueries';

/**
 * Suggestion list shown while typing @mentions in a content post.
 * Each match displays the user's avatar beside their byline.
 *
 * Results are rendered exactly as the server returns them, other than being reversed (see
 * below). The endpoint matches on all names (username, display name, real name), so do not
 * re-filter on username here: that drops the display-name matches, which are usually the
 * favorites that sort=favorites just promoted. Selecting a suggestion inserts the username
 * regardless of which name matched.
 *
 * This list renders *above* the composer's text input, so the server's favorites-first order
 * would put the best matches farthest from where the user is typing (and off the top of the
 * list once it scrolls). The order is reversed and the list opens scrolled to the end, putting
 * the favorites nearest the input.
 */
export const ContentPostMentionSuggestionsView: FC<SuggestionsProvidedProps> = ({keyword, onSelect}) => {
  const {data, isFetching} = useUserMatchQuery({searchQuery: keyword || '', sort: UserMatchSort.favorites});
  const {commonStyles} = useStyles();
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Bounded so that ContentPostForm's own 300pt container always keeps the composer row
  // (input and submit button) on screen; without a cap, a long result list pushes the
  // composer out of the form's ScrollView. The fraction keeps small devices usable.
  const screenHeight = Dimensions.get('window').height;
  const maxHeight = Math.min(180, screenHeight * 0.25);

  // reverse() on a copy: the array belongs to the React Query cache.
  const orderedData = useMemo(() => (data ? [...data].reverse() : []), [data]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // Anchors the absolutely-positioned scroll indicators. The background is explicit so
        // the indicators (which sit on top of the rows) can be given a matching one.
        container: {
          position: 'relative',
          maxHeight: maxHeight,
          ...commonStyles.background,
        },
        scrollView: {
          maxHeight: maxHeight,
        },
        pressable: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          padding: 12,
        },
        byline: {
          ...commonStyles.marginLeftSmall,
          ...commonStyles.flex,
        },
        loading: {
          ...commonStyles.marginVertical,
        },
      }),
    [commonStyles, maxHeight],
  );

  // Indicators appear only while the list is resting at one end, matching AppMenu. Since this
  // list opens scrolled to the end, the "more above" indicator is the one visible on open.
  const isScrollable = contentHeight > maxHeight;
  const isAtTop = scrollY < 10;
  const showTopIndicator = isScrollable && isAtBottom && !isAtTop;
  const showBottomIndicator = isScrollable && isAtTop && !isAtBottom;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const maxScrollY = contentSize.height - layoutMeasurement.height;
    setScrollY(contentOffset.y);
    setIsAtBottom(contentOffset.y >= maxScrollY - 5);
  };

  /**
   * Pins the list to its end whenever the results change, so the favorites nearest the input
   * are what the user sees. The indicator state is set here rather than left to the onScroll
   * this triggers, so it is correct even if the programmatic scroll reports nothing.
   */
  const handleContentSizeChange = (_width: number, height: number) => {
    setContentHeight(height);
    scrollViewRef.current?.scrollToEnd({animated: false});
    setScrollY(Math.max(0, height - maxHeight));
    setIsAtBottom(true);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({animated: false});
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({y: 0, animated: false});
  };

  if (keyword == null) {
    return null;
  }

  if (isFetching) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        // 'always' matches the enclosing ContentPostForm: a suggestion must be tappable
        // while the keyboard is up, which is the only time this list is visible.
        keyboardShouldPersistTaps={'always'}
        // Android needs this to scroll a ScrollView nested in ContentPostForm's ScrollView.
        nestedScrollEnabled={true}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={handleContentSizeChange}
        scrollsToTop={false}>
        {orderedData.map(one => (
          <Pressable
            key={one.userID}
            onPress={() => onSelect({id: one.userID, name: one.username})}
            style={styles.pressable}>
            <AvatarImage userHeader={one} small />
            <View style={styles.byline}>
              <UserBylineTag user={one} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <MenuScrollIndicator
        visible={showTopIndicator}
        onPress={scrollToTop}
        direction={'up'}
        backgroundStyle={commonStyles.background}
      />
      <MenuScrollIndicator
        visible={showBottomIndicator}
        onPress={scrollToBottom}
        direction={'down'}
        backgroundStyle={commonStyles.background}
      />
    </View>
  );
};
