import {StackScreenProps} from '@react-navigation/stack';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import PagerView, {type PagerViewOnPageSelectedEvent} from 'react-native-pager-view';

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
import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';

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

  /**
   * Staged query rollout: we're on a high-latency, low-bandwidth ship network, so every cruise
   * day cannot fire its queries at once. Start with only the initially-viewed day enabled; each
   * time an enabled day finishes loading, enable its immediate neighbors next, radiating outward
   * one ring at a time until the whole cruise is loaded.
   */
  const [enabledDays, setEnabledDays] = useState<Set<number>>(() => new Set([selectedCruiseDay]));

  // Whichever day becomes active must load immediately regardless of how far the rollout has
  // radiated - e.g. a header tap to a distant day, or swiping ahead of the preload wave.
  useEffect(() => {
    setEnabledDays(prev => (prev.has(selectedCruiseDay) ? prev : new Set(prev).add(selectedCruiseDay)));
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
   * Mirror the active day's vertical scroll position onto every other mounted day, so
   * whichever day a swipe lands on is already sitting at the same time of day.
   */
  const handleActiveScroll = useCallback(
    (offsetY: number) => {
      scrollOffsetRef.current = offsetY;
      scrollControllersRef.current.forEach((controller, day) => {
        if (day !== selectedCruiseDay) {
          controller.scrollTo(offsetY);
        }
      });
    },
    [selectedCruiseDay],
  );

  const scrollToNow = useCallback(() => {
    activeControlsRef.current?.scrollToNow();
  }, []);

  const onRefresh = useCallback(async () => {
    await activeControlsRef.current?.refresh();
  }, []);

  const handlePageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const newDay = e.nativeEvent.position + 1;
      if (newDay !== selectedCruiseDay) {
        setSelectedCruiseDay(newDay);
      }
    },
    [selectedCruiseDay, setSelectedCruiseDay],
  );

  /**
   * Keep the pager on the active day when it changes from outside a swipe (header day-chip
   * tap, or a distant jump). A no-op when the change came from a swipe settling, since the
   * pager is already sitting on that exact index.
   */
  useEffect(() => {
    pagerRef.current?.setPageWithoutAnimation(activeIndex);
  }, [activeIndex]);

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
      />
      <PagerView
        ref={pagerRef}
        style={commonStyles.flex}
        initialPage={activeIndex}
        overdrag
        onPageSelected={handlePageSelected}>
        {allDays.map(day => (
          <View key={day} collapsable={false} style={commonStyles.flex}>
            <DayPlannerPage
              cruiseDay={day}
              isActive={day === selectedCruiseDay}
              enabled={enabledDays.has(day)}
              onLoaded={handleDayLoaded}
              onActiveControlsChange={handleActiveControlsChange}
              onRegisterScrollController={registerScrollControllerCallbacks[day - 1]}
              onActiveScroll={handleActiveScroll}
              initialScrollOffset={scrollOffsetRef.current}
            />
          </View>
        ))}
      </PagerView>
      {!preRegistrationMode && <ScheduleDayPlannerFAB cruiseDay={selectedCruiseDay} />}
    </AppView>
  );
};
