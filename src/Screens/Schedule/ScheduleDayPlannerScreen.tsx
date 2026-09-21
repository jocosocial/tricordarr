import {StackScreenProps} from '@react-navigation/stack';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import PagerView, {
  type PagerViewOnPageSelectedEvent,
  type PageScrollStateChangedNativeEvent,
} from 'react-native-pager-view';
import Animated from 'react-native-reanimated';

import {ScheduleDayPlannerFAB} from '#src/Components/Buttons/FloatingActionButtons/ScheduleDayPlannerFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ScheduleDayScreenActionsMenu} from '#src/Components/Menus/Schedule/ScheduleDayScreenActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {
  DayPlannerPage,
  type DayPlannerPageControls,
  type DayPlannerScrollController,
} from '#src/Components/Views/Schedule/DayPlannerPage';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useScheduleCruiseDay} from '#src/Context/Contexts/ScheduleCruiseDayContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {usePagerSelectedDay} from '#src/Hooks/usePagerSelectedDay';
import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.scheduleDayPlannerScreen>;

export const ScheduleDayPlannerScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={'/dayplanner'}>
        <ScheduleDayPlannerScreenInner {...props} />
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};

const ScheduleDayPlannerScreenInner = ({navigation}: Props) => {
  const {adjustedCruiseDayToday, cruiseDays} = useCruise();
  const {selectedCruiseDay: contextCruiseDay, setSelectedCruiseDay} = useScheduleCruiseDay();
  // Day Planner doesn't support cruiseDay 0 (All Days). Display today without writing
  // back until the user picks a day, so All Days → Planner → Back stays on All Days.
  const selectedCruiseDay = contextCruiseDay === 0 ? adjustedCruiseDayToday : contextCruiseDay;
  const {commonStyles} = useStyles();
  const {preRegistrationMode} = usePreRegistration();
  const pagerRef = useRef<PagerView>(null);
  const activeControlsRef = useRef<DayPlannerPageControls | null>(null);

  // Vertical scroll position shared across days so switching days (swipe or header tap) keeps
  // the same time of day in view instead of resetting. Null until any page has ever scrolled.
  const scrollOffsetRef = useRef<number | null>(null);
  const scrollControllersRef = useRef<Map<number, DayPlannerScrollController>>(new Map());

  const totalDays = cruiseDays?.length ?? 1;
  /**
   * Every cruise day is mounted as its own permanently-keyed page (key = day number, not array
   * position), so switching days - by swipe or header tap - only ever moves which index is
   * "active"; the content already at every index never changes. That's what keeps a swipe from
   * ever flashing the wrong day: there's no sliding window to recenter/relabel after a swipe
   * settles, and nothing to swipe past at the first or last day since no further page exists.
   */
  const allDays = useMemo(() => Array.from({length: totalDays}, (_, i) => i + 1), [totalDays]);
  const activeIndex = Math.min(Math.max(selectedCruiseDay - 1, 0), totalDays - 1);

  // Mirrors of the current day/index for use inside event handlers, so those handlers can keep a
  // stable identity instead of re-creating (and re-rendering all pages) on every day change.
  const selectedCruiseDayRef = useRef(selectedCruiseDay);
  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    selectedCruiseDayRef.current = selectedCruiseDay;
    activeIndexRef.current = activeIndex;
  }, [selectedCruiseDay, activeIndex]);

  /**
   * Drives the header's day highlight from the pager drag on the UI thread, so it moves with the
   * content instead of waiting for onPageSelected (which only fires once the swipe has fully
   * settled). selectedCruiseDay itself still commits on settle - queries, the FAB and the scroll
   * sync are all deliberately left behind the highlight.
   */
  const {liveSelectedDay, onPageScroll} = usePagerSelectedDay(selectedCruiseDay, totalDays);

  // Fallback: keep the shared value honest from JS whenever the day actually commits. If the
  // worklet handler ever fails to attach, the highlight degrades to the old settle-time timing
  // rather than freezing on a stale day.
  useEffect(() => {
    liveSelectedDay.value = activeIndex + 1;
  }, [activeIndex, liveSelectedDay]);

  /**
   * Staged query rollout: we're on a high-latency, low-bandwidth ship network, so every cruise
   * day cannot fire its queries at once. Start with only the initially-viewed day enabled; each
   * time an enabled day finishes loading, enable its immediate neighbors next, radiating outward
   * one ring at a time until the whole cruise is loaded.
   */
  const [enabledDays, setEnabledDays] = useState<Set<number>>(() => new Set([selectedCruiseDay]));

  /**
   * Which days may build their (~200-view) timeline. A high-water mark, never shrunk: a day is
   * added once it is viewed or adjacent to the viewed day, and keeps its timeline from then on.
   * Cold open therefore builds three timelines instead of all eight, days you never visit build
   * none, and no swipe ever mounts or tears one down mid-gesture.
   */
  const [renderedDays, setRenderedDays] = useState<Set<number>>(
    () => new Set([selectedCruiseDay - 1, selectedCruiseDay, selectedCruiseDay + 1]),
  );

  // Whichever day becomes active must load and render immediately regardless of how far the
  // rollout has radiated - e.g. a header tap to a distant day, or swiping ahead of the wave.
  useEffect(() => {
    setEnabledDays(prev => (prev.has(selectedCruiseDay) ? prev : new Set(prev).add(selectedCruiseDay)));
    setRenderedDays(prev => {
      const additions = [selectedCruiseDay - 1, selectedCruiseDay, selectedCruiseDay + 1].filter(d => !prev.has(d));
      if (additions.length === 0) {
        return prev;
      }
      const next = new Set(prev);
      additions.forEach(d => next.add(d));
      return next;
    });
  }, [selectedCruiseDay]);

  const handleDayLoaded = useCallback(
    (day: number) => {
      setEnabledDays(prev => {
        const additions = [day - 1, day + 1].filter(d => d >= 1 && d <= totalDays && !prev.has(d));
        if (additions.length === 0) {
          return prev;
        }
        const next = new Set(prev);
        additions.forEach(d => next.add(d));
        return next;
      });
    },
    [totalDays],
  );

  const handleActiveControlsChange = useCallback((controls: DayPlannerPageControls | null) => {
    activeControlsRef.current = controls;
  }, []);

  const registerScrollController = useCallback((day: number, controller: DayPlannerScrollController | null) => {
    if (controller) {
      scrollControllersRef.current.set(day, controller);
    } else {
      scrollControllersRef.current.delete(day);
    }
  }, []);

  // Stable per-day callback identity (rebuilt only when the cruise length changes) so each
  // DayPlannerPage doesn't re-register its scroll controller on every unrelated render.
  const registerScrollControllerCallbacks = useMemo(
    () =>
      allDays.map(day => (controller: DayPlannerScrollController | null) => registerScrollController(day, controller)),
    [allDays, registerScrollController],
  );

  /**
   * Record where the active day's scroll gesture came to rest. Only the offset is stored here;
   * pushing it onto the other days happens at the moments it can matter (a swipe starting, or a
   * jump from the header), not on every scroll frame.
   */
  const handleScrollSettled = useCallback((offsetY: number) => {
    scrollOffsetRef.current = offsetY;
  }, []);

  /** Read by each page when it first mounts its ScrollView, so it opens at the shared time of day. */
  const getSharedOffset = useCallback(() => scrollOffsetRef.current, []);

  /**
   * Align every other mounted day with the shared offset so whichever day comes into view is
   * already sitting at the same time of day. Called once per day-change gesture rather than per
   * frame - pages already at the right offset are unaffected by a repeat scrollTo.
   */
  const alignOtherPages = useCallback(() => {
    const offsetY = scrollOffsetRef.current;
    if (offsetY === null) {
      return;
    }
    scrollControllersRef.current.forEach((controller, day) => {
      if (day !== selectedCruiseDayRef.current) {
        controller.scrollTo(offsetY);
      }
    });
  }, []);

  /**
   * A swipe is starting (or settling): make sure the neighbours are positioned before they slide
   * into view. This is the replacement for mirroring on every scroll frame.
   */
  const handlePageScrollStateChanged = useCallback(
    (e: PageScrollStateChangedNativeEvent) => {
      if (e.nativeEvent.pageScrollState === 'dragging') {
        alignOtherPages();
      }
    },
    [alignOtherPages],
  );

  const scrollToNow = useCallback(() => {
    activeControlsRef.current?.scrollToNow();
  }, []);

  const onRefresh = useCallback(async () => {
    await activeControlsRef.current?.refresh();
  }, []);

  // Index the pager has actually told us it is on. Seeded with the mount index because
  // `initialPage` already puts it there, so the sync effect below no-ops on first run.
  const lastReportedIndexRef = useRef(activeIndex);
  const hasReceivedPageSelectedRef = useRef(false);

  const handlePageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const position = e.nativeEvent.position;
      if (!hasReceivedPageSelectedRef.current) {
        hasReceivedPageSelectedRef.current = true;
        // Android can emit an initial onPageSelected(0) before `initialPage` has been applied.
        // Letting that through would write day 1 into the shared schedule day context - including
        // overwriting "All Days", which this screen deliberately avoids touching. Re-assert the
        // page we actually want instead.
        if (position !== activeIndexRef.current) {
          pagerRef.current?.setPageWithoutAnimation(activeIndexRef.current);
          return;
        }
      }
      lastReportedIndexRef.current = position;
      const newDay = position + 1;
      if (newDay !== selectedCruiseDayRef.current) {
        setSelectedCruiseDay(newDay);
      }
    },
    [setSelectedCruiseDay],
  );

  /**
   * Keep the pager on the active day when it changes from outside a swipe (header day-chip tap,
   * or a distant jump). Skipped when the pager already reported this index - i.e. a swipe that
   * just settled - so a gesture doesn't trigger a redundant native page set back onto itself.
   */
  useEffect(() => {
    if (lastReportedIndexRef.current === activeIndex) {
      return;
    }
    lastReportedIndexRef.current = activeIndex;
    // Position the destination before jumping to it, so it doesn't appear at a stale offset.
    alignOtherPages();
    pagerRef.current?.setPageWithoutAnimation(activeIndex);
  }, [activeIndex, alignOtherPages]);

  // Header buttons
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <ScheduleDayScreenActionsMenu
            onRefresh={onRefresh}
            helpScreen={CommonStackComponents.scheduleDayPlannerHelpScreen}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [onRefresh]);

  // Set header buttons
  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <TimezoneWarningView />
      <ScheduleHeaderView
        selectedCruiseDay={selectedCruiseDay}
        setCruiseDay={setSelectedCruiseDay}
        scrollToNow={scrollToNow}
        liveSelectedDay={liveSelectedDay}
      />
      <AnimatedPagerView
        ref={pagerRef}
        style={commonStyles.flex}
        initialPage={activeIndex}
        overdrag
        onPageSelected={handlePageSelected}
        onPageScrollStateChanged={handlePageScrollStateChanged}
        onPageScroll={onPageScroll as never}>
        {allDays.map(day => (
          <View key={day} collapsable={false} style={commonStyles.flex}>
            <DayPlannerPage
              cruiseDay={day}
              isActive={day === selectedCruiseDay}
              enabled={enabledDays.has(day)}
              renderTimeline={renderedDays.has(day)}
              onLoaded={handleDayLoaded}
              onActiveControlsChange={handleActiveControlsChange}
              onRegisterScrollController={registerScrollControllerCallbacks[day - 1]}
              onScrollSettled={handleScrollSettled}
              getSharedOffset={getSharedOffset}
            />
          </View>
        ))}
      </AnimatedPagerView>
      {!preRegistrationMode && <ScheduleDayPlannerFAB cruiseDay={selectedCruiseDay} />}
    </AppView>
  );
};
