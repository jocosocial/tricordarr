import FastImage, {type ImageStyle as FastImageStyle} from '@d11/react-native-fast-image';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {LayoutChangeEvent, ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DeckMapMenu} from '#src/Components/Menus/DeckMapMenu';
import {MapScreenActionsMenu} from '#src/Components/Menus/Main/MapScreenActionsMenu';
import {MapSearchBar} from '#src/Components/Search/MapSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {MapHighlightOverlay} from '#src/Components/Views/MapHighlightOverlay';
import {MapIndicatorView} from '#src/Components/Views/MapIndicatorView';
import {ErrorView} from '#src/Components/Views/Static/ErrorView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {useCachedImageSource} from '#src/Hooks/useCachedImageSource';
import {MapTarget, resolveTarget, ShipSearchResult} from '#src/Libraries/ShipIndex';
import {joinUrl} from '#src/Libraries/UrlParser';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useShipIndexQuery} from '#src/Queries/Ship/ShipQueries';
import {ShipDeck} from '#src/Structs/ShipStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.mapScreen>;

// Vertical offset above a scrolled-to target so it isn't flush against the header.
const SCROLL_TOP_PADDING = 24;

export const MapScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const {data: index, isLoading, isError, refetch, isRefetching} = useShipIndexQuery();

  // Drive the pull-to-refresh spinner from local state set synchronously inside
  // the gesture handler, rather than isRefetching alone: isRefetching only flips
  // true once React Query's fetch actually starts, one render tick after the
  // native gesture already released and closed its own spinner — which reads as
  // a spin/stop/spin flicker. Setting this immediately keeps the spinner up
  // continuously through that gap.
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const [activeTarget, setActiveTarget] = useState<MapTarget | undefined>(undefined);
  // Set only by the deck menu. Manually switching decks is a "keep looking at
  // roughly the same part of the ship" gesture, so it deliberately does not
  // touch activeTarget/scroll position — every deck's image is the same pixel
  // size (one shared crop per ship), so leaving the scroll offset alone lands
  // on roughly the same physical location on the new deck. Cleared whenever a
  // real target (route params, search) should take over deck + scroll again.
  const [manualDeckNumber, setManualDeckNumber] = useState<number | undefined>(undefined);
  const [imageLayout, setImageLayout] = useState({width: 0, height: 0});
  const [searchVisible, setSearchVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollContentRef = useRef<View | null>(null);
  const imageContainerRef = useRef<View | null>(null);
  const lastScrolledKey = useRef<string | undefined>(undefined);
  const preloadedRef = useRef(false);
  const previousShipRef = useRef<string | undefined>(undefined);

  const params = route.params;

  // Resolve the route params against the index whenever either changes. Does not
  // re-run when the user picks a search result — that sets activeTarget directly.
  useEffect(() => {
    if (!index) {
      return;
    }
    // A different ship's assets loaded (the Ship cruise setting changed, not
    // just a stale-data refetch of the same one) — start over at the top of
    // deck 1 rather than carrying over wherever the previous ship's route
    // params or manual deck pick left off.
    if (previousShipRef.current !== undefined && previousShipRef.current !== index.ship) {
      previousShipRef.current = index.ship;
      setManualDeckNumber(undefined);
      lastScrolledKey.current = undefined;
      setActiveTarget({deckNumber: index.decks[0].number, labels: []});
      return;
    }
    previousShipRef.current = index.ship;

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
    index?.decks.find(d => d.number === (manualDeckNumber ?? activeTarget?.deckNumber)) ?? index?.decks[0];

  const highlightLabels =
    manualDeckNumber === undefined && shipDeck?.number === activeTarget?.deckNumber ? (activeTarget?.labels ?? []) : [];

  // Each ship's assets live under their own code (/public/ship/hal-ed/, .../hal-ko/,
  // ...), so switching appConfig.shipCode is itself a different URL per deck image.
  // Stale cached images are handled the same way as everywhere else in the app:
  // "Clear Image Cache" on the Query Settings developer screen.
  const buildShipAssetUrl = useCallback(
    (path: string) => joinUrl(serverUrl, '/public/ship', appConfig.shipCode, path),
    [serverUrl, appConfig.shipCode],
  );

  const imageUri = shipDeck ? buildShipAssetUrl(shipDeck.image) : undefined;
  const imageSource = useCachedImageSource(imageUri);
  const aspectRatio = index?.geometry.imagePx ? index.geometry.imagePx.w / index.geometry.imagePx.h : undefined;

  // Keyed on the deck number (not imageSource.uri, which changes again once the
  // disk cache lookup resolves) so the spinner doesn't flash back on for the
  // same image, only when switching to a genuinely different deck.
  useEffect(() => {
    setImageLoading(true);
  }, [shipDeck?.number]);

  const onSelectDeck = useCallback((deck: ShipDeck) => {
    setManualDeckNumber(deck.number);
  }, []);

  const onSelectSearchResult = useCallback((result: ShipSearchResult) => {
    setManualDeckNumber(undefined);
    setActiveTarget({deckNumber: result.deckNumber, labels: result.labels});
    setSearchVisible(false);
  }, []);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item title={'Search'} iconName={AppIcons.search} onPress={() => setSearchVisible(v => !v)} />
          {index && shipDeck && (
            <DeckMapMenu decks={index.decks} currentDeckNumber={shipDeck.number} onSelect={onSelectDeck} />
          )}
          <MapScreenActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, [index, shipDeck, onSelectDeck]);

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

  // Once the current deck's image has actually finished loading (not just after
  // a flat delay — on a slow connection the first image can easily take longer
  // than imagePreloadDelaySeconds, and starting the low-priority preload early
  // would just compete with it for bandwidth), warm the disk cache for the rest
  // of the ship so switching decks (or a later deep link) doesn't re-download.
  useEffect(() => {
    if (preloadedRef.current || !index || !imageSource?.uri || imageLoading) {
      return;
    }
    const timer = setTimeout(() => {
      preloadedRef.current = true;
      const others = index.decks.filter(d => d.number !== shipDeck?.number);
      FastImage.preload(others.map(d => ({uri: buildShipAssetUrl(d.image), priority: FastImage.priority.low})));
    }, appConfig.imagePreloadDelaySeconds * 1000);
    return () => clearTimeout(timer);
  }, [index, imageSource?.uri, imageLoading, shipDeck?.number, buildShipAssetUrl, appConfig.imagePreloadDelaySeconds]);

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
    // Absolutely positioned sibling of ScrollingContentView (like MapSearchBar
    // below), not a child of imageWrap: imageWrap is as tall as the whole deck
    // image, so centering within *it* can land the spinner far below the
    // currently-scrolled viewport on a long deck. Covering the screen instead
    // keeps it visible regardless of scroll position or image height.
    imageLoadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
    },
  });

  if (isLoading) {
    return (
      <AppView>
        <LoadingView />
      </AppView>
    );
  }

  if (isError || !index || index.decks.length === 0) {
    return <ErrorView refreshing={refreshing || isRefetching} onRefresh={handleRefresh} />;
  }

  if (!shipDeck) {
    return <ErrorView refreshing={refreshing || isRefetching} onRefresh={handleRefresh} />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        ref={scrollViewRef}
        refreshControl={<AppRefreshControl refreshing={refreshing || isRefetching} onRefresh={handleRefresh} />}>
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
                <FastImage
                  key={shipDeck.number}
                  style={styles.image as FastImageStyle}
                  source={imageSource}
                  onLoadEnd={() => setImageLoading(false)}
                />
              )}
              <MapHighlightOverlay width={imageLayout.width} height={imageLayout.height} labels={highlightLabels} />
            </View>
          </View>
          <MapIndicatorView direction={'Aft'} />
        </View>
      </ScrollingContentView>
      {imageLoading && (
        <View style={styles.imageLoadingOverlay} pointerEvents={'none'}>
          <ActivityIndicator />
        </View>
      )}
      {/* Deliberately outside ScrollingContentView: this must stay visible regardless
          of scroll position, or hitting search while looking at the aft of the ship
          appears to do nothing. */}
      <MapSearchBar visible={searchVisible} index={index} onSelectResult={onSelectSearchResult} />
    </AppView>
  );
};
