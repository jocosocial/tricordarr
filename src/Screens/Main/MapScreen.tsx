import FastImage, {type ImageStyle as FastImageStyle} from '@d11/react-native-fast-image';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ListItem} from '#src/Components/Lists/ListItem';
import {DeckMapMenu} from '#src/Components/Menus/DeckMapMenu';
import {MapScreenActionsMenu} from '#src/Components/Menus/Main/MapScreenActionsMenu';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {MapHighlightOverlay} from '#src/Components/Views/MapHighlightOverlay';
import {MapIndicatorView} from '#src/Components/Views/MapIndicatorView';
import {MenuScrollIndicator} from '#src/Components/Views/MenuScrollIndicator';
import {ErrorView} from '#src/Components/Views/Static/ErrorView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useCachedImageSource} from '#src/Hooks/useCachedImageSource';
import {MapTarget, resolveTarget, searchLabels, ShipSearchResult} from '#src/Libraries/ShipIndex';
import {joinUrl} from '#src/Libraries/UrlParser';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useShipIndexQuery} from '#src/Queries/Ship/ShipQueries';
import {ShipDeck} from '#src/Structs/ShipStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.mapScreen>;

// Vertical offset above a scrolled-to target so it isn't flush against the header.
const SCROLL_TOP_PADDING = 24;

// Cap on the search results panel's height, in points, before it scrolls
// instead of growing further. Sized to content up to this cap (see
// resultsContentHeight below) rather than always reserving this much space —
// a plain percentage-of-screen maxHeight leaves blank space under a couple
// of results, which is the "wasted space" AppMenu's own results list avoids.
const MAX_RESULTS_HEIGHT = 320;

export const MapScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const {data: index, isLoading, isError, refetch, isRefetching} = useShipIndexQuery();

  const [activeTarget, setActiveTarget] = useState<MapTarget | undefined>(undefined);
  const [imageLayout, setImageLayout] = useState({width: 0, height: 0});
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Bumped by the header "Reload" action. Deck images are otherwise cached for as
  // long as any other API image (see appConfig.apiClientConfig.imageStaleTime,
  // 30 days by default) — this forces a real re-fetch on demand by giving the
  // cache-key-by-URI logic in useCachedImageSource / FastImage a new URI to key
  // on, rather than clearing the app's entire shared image cache.
  const [reloadToken, setReloadToken] = useState(0);
  const [resultsContentHeight, setResultsContentHeight] = useState(0);
  const [resultsAtBottom, setResultsAtBottom] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollContentRef = useRef<View | null>(null);
  const imageContainerRef = useRef<View | null>(null);
  const lastScrolledKey = useRef<string | undefined>(undefined);
  const preloadedRef = useRef(false);
  const resultsScrollRef = useRef<ScrollView>(null);

  const params = route.params;

  // Resolve the route params against the index whenever either changes. Does not
  // re-run when the user picks a search result — that sets activeTarget directly.
  useEffect(() => {
    if (!index) {
      return;
    }
    setActiveTarget(
      resolveTarget(index, {
        deckNumber: params?.deckNumber !== undefined ? Number(params.deckNumber) : undefined,
        region: params?.region,
        venue: params?.venue,
        room: params?.room,
        location: params?.location,
      }),
    );
  }, [index, params?.deckNumber, params?.region, params?.venue, params?.room, params?.location]);

  const shipDeck: ShipDeck | undefined =
    index?.decks.find(d => d.number === activeTarget?.deckNumber) ?? index?.decks[0];

  const highlightLabels = shipDeck?.number === activeTarget?.deckNumber ? (activeTarget?.labels ?? []) : [];

  // Each ship's assets live under their own code (/public/ship/hal-ed/, .../hal-ko/,
  // ...), so switching appConfig.shipCode is itself a different URL per deck image -
  // no separate cache-busting needed to tell "the operator deployed a different
  // ship" from "nothing changed". reloadToken (below) is only the manual override
  // for re-fetching the *same* ship's assets on demand.
  const buildShipAssetUrl = useCallback(
    (path: string) => {
      const base = joinUrl(serverUrl, '/public/ship', appConfig.shipCode, path);
      return reloadToken > 0 ? `${base}?reload=${reloadToken}` : base;
    },
    [serverUrl, appConfig.shipCode, reloadToken],
  );

  const imageUri = shipDeck ? buildShipAssetUrl(shipDeck.image) : undefined;
  const imageSource = useCachedImageSource(imageUri);
  const aspectRatio = index?.geometry.imagePx ? index.geometry.imagePx.w / index.geometry.imagePx.h : undefined;

  const searchResults: ShipSearchResult[] = useMemo(() => searchLabels(index, searchQuery), [index, searchQuery]);

  // A fresh set of results should start scrolled to top, not carry over
  // "at bottom" from whatever the previous query's results looked like.
  useEffect(() => {
    setResultsAtBottom(false);
  }, [searchResults]);

  const onSelectDeck = useCallback((deck: ShipDeck) => {
    setActiveTarget({deckNumber: deck.number, labels: []});
  }, []);

  const onSelectSearchResult = useCallback((result: ShipSearchResult) => {
    setActiveTarget({deckNumber: result.deckNumber, labels: result.labels});
    setSearchVisible(false);
    setSearchQuery('');
  }, []);

  const onSearchClear = useCallback(() => setSearchQuery(''), []);

  const onResultsScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const maxScrollY = contentSize.height - layoutMeasurement.height;
    setResultsAtBottom(contentOffset.y >= maxScrollY - 5);
  }, []);

  const onReload = useCallback(() => {
    // Re-arm the preload effect below so it fires again for the bumped URIs,
    // and force the index itself past its own staleTime.
    preloadedRef.current = false;
    setReloadToken(t => t + 1);
    refetch();
  }, [refetch]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item title={'Search'} iconName={AppIcons.search} onPress={() => setSearchVisible(v => !v)} />
          {index && shipDeck && (
            <DeckMapMenu decks={index.decks} currentDeckNumber={shipDeck.number} onSelect={onSelectDeck} />
          )}
          <MapScreenActionsMenu onReload={onReload} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [index, shipDeck, onSelectDeck, onReload]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const handleImageLayout = useCallback((event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setImageLayout({width, height});
  }, []);

  // Scroll to the resolved target once its layout is known. Re-runs only when the
  // target itself changes (deck/region/labels), not on every layout pass.
  useEffect(() => {
    if (!activeTarget || !shipDeck || imageLayout.height === 0) {
      return;
    }
    const key = `${activeTarget.deckNumber}:${activeTarget.region ?? ''}:${activeTarget.labels
      .map(l => `${l.x},${l.y}`)
      .join(',')}`;
    if (lastScrolledKey.current === key) {
      return;
    }
    lastScrolledKey.current = key;

    let fraction = 0;
    if (activeTarget.labels.length > 0) {
      fraction = Math.min(...activeTarget.labels.map(l => l.y));
    } else if (activeTarget.region) {
      fraction = shipDeck.regions[activeTarget.region][0];
    }

    if (!imageContainerRef.current || !scrollContentRef.current) {
      return;
    }
    imageContainerRef.current.measureLayout(scrollContentRef.current, (_x, y) => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, y + fraction * imageLayout.height - SCROLL_TOP_PADDING),
        animated: true,
      });
    });
  }, [activeTarget, shipDeck, imageLayout.height]);

  // Once the current deck's image is on screen, warm the disk cache for the rest
  // of the ship so switching decks (or a later deep link) doesn't re-download.
  useEffect(() => {
    if (preloadedRef.current || !index || !imageSource?.uri) {
      return;
    }
    const timer = setTimeout(() => {
      preloadedRef.current = true;
      const others = index.decks.filter(d => d.number !== shipDeck?.number);
      FastImage.preload(others.map(d => ({uri: buildShipAssetUrl(d.image), priority: FastImage.priority.low})));
    }, appConfig.imagePreloadDelaySeconds * 1000);
    return () => clearTimeout(timer);
  }, [index, imageSource?.uri, shipDeck?.number, buildShipAssetUrl, appConfig.imagePreloadDelaySeconds]);

  const styles = StyleSheet.create({
    // Padding lives here, on the outer wrapper, so it does not throw off the
    // overlay/scroll math below — that math measures imageWrap, which must
    // be exactly the image's own box with nothing padding it out.
    imagePadding: {
      ...commonStyles.paddingHorizontal,
      ...commonStyles.paddingVertical,
      ...commonStyles.flex,
    },
    imageWrap: {
      position: 'relative',
    },
    image: {
      flex: 1,
      height: undefined,
      width: undefined,
      aspectRatio,
    },
    searchOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      elevation: 10,
      backgroundColor: theme.colors.background,
      ...commonStyles.paddingHorizontalSmall,
    },
    searchResultsContainer: {
      position: 'relative',
    },
    searchResults: {
      // Sized to the actual content up to the cap, not always the cap itself —
      // a bare maxHeight here reserves that much blank space under a couple
      // of results, same as AppMenu was written to avoid.
      maxHeight: Math.min(resultsContentHeight, MAX_RESULTS_HEIGHT),
    },
  });

  const isResultsScrollable = resultsContentHeight > MAX_RESULTS_HEIGHT;
  const showResultsScrollIndicator = isResultsScrollable && !resultsAtBottom;

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError || !index || index.decks.length === 0) {
    return <ErrorView refreshing={isRefetching} onRefresh={refetch} />;
  }

  if (!shipDeck) {
    return <ErrorView refreshing={isRefetching} onRefresh={refetch} />;
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true} ref={scrollViewRef}>
        <View
          ref={ref => {
            scrollContentRef.current = ref;
          }}>
          <ListTitleView
            title={`Deck ${shipDeck.number}${shipDeck.name ? ` - ${shipDeck.name}` : ''}`}
            subtitle={shipDeck.roomStart ? `Staterooms ${shipDeck.roomStart} - ${shipDeck.roomEnd}` : undefined}
          />
          <MapIndicatorView direction={'Forward'} />
          <View style={styles.imagePadding}>
            <View
              style={styles.imageWrap}
              ref={ref => {
                imageContainerRef.current = ref;
              }}
              onLayout={handleImageLayout}>
              {imageSource && (
                <FastImage key={shipDeck.number} style={styles.image as FastImageStyle} source={imageSource} />
              )}
              <MapHighlightOverlay width={imageLayout.width} height={imageLayout.height} labels={highlightLabels} />
            </View>
          </View>
          <MapIndicatorView direction={'Aft'} />
        </View>
      </ScrollingContentView>
      {searchVisible && (
        // Deliberately outside ScrollingContentView: this must stay visible
        // regardless of scroll position, or hitting search while looking at
        // the aft of the ship appears to do nothing.
        <View style={styles.searchOverlay}>
          <SearchBarBase
            testID={'mapSearch-input'}
            searchQuery={searchQuery}
            onChangeSearch={setSearchQuery}
            onClear={onSearchClear}
            autoSearch={true}
            minLength={2}
            placeholder={'Search venues and staterooms'}
          />
          <View style={styles.searchResultsContainer}>
            <ScrollView
              ref={resultsScrollRef}
              style={styles.searchResults}
              scrollEnabled={isResultsScrollable}
              onContentSizeChange={(_w, h) => setResultsContentHeight(h)}
              onScroll={onResultsScroll}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps={'handled'}>
              {searchResults.map(result => (
                <ListItem
                  key={`${result.deckNumber}:${result.key}`}
                  title={result.name}
                  description={`Deck ${result.deckNumber}`}
                  onPress={() => onSelectSearchResult(result)}
                />
              ))}
            </ScrollView>
            <MenuScrollIndicator
              visible={showResultsScrollIndicator}
              onPress={() => resultsScrollRef.current?.scrollToEnd()}
            />
          </View>
        </View>
      )}
    </AppView>
  );
};
