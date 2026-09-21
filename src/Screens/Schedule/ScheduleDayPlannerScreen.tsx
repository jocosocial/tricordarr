import {StackScreenProps} from '@react-navigation/stack';
import {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import PagerView, {type PagerViewOnPageSelectedEvent} from 'react-native-pager-view';

import {ScheduleDayPlannerFAB} from '#src/Components/Buttons/FloatingActionButtons/ScheduleDayPlannerFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ScheduleDayScreenActionsMenu} from '#src/Components/Menus/Schedule/ScheduleDayScreenActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {DayPlannerPage, type DayPlannerPageControls} from '#src/Components/Views/Schedule/DayPlannerPage';
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

  const totalDays = cruiseDays?.length ?? 1;
  const hasPrevDay = selectedCruiseDay > 1;
  const hasNextDay = selectedCruiseDay < totalDays;

  /**
   * Window of pages around the selected day, omitting a neighbor entirely when it would
   * fall outside the cruise. With no page to scroll to, PagerView has nowhere to carry a
   * drag past the first/last day, instead of just landing back on the same content.
   */
  const windowDays = useMemo(() => {
    const days: number[] = [];
    if (hasPrevDay) {
      days.push(selectedCruiseDay - 1);
    }
    days.push(selectedCruiseDay);
    if (hasNextDay) {
      days.push(selectedCruiseDay + 1);
    }
    return days;
  }, [selectedCruiseDay, hasPrevDay, hasNextDay]);

  // Index of the selected day within windowDays - shifts to 0 when there's no previous-day page.
  const activeIndex = hasPrevDay ? 1 : 0;

  const handleActiveControlsChange = useCallback((controls: DayPlannerPageControls | null) => {
    activeControlsRef.current = controls;
  }, []);

  const scrollToNow = useCallback(() => {
    activeControlsRef.current?.scrollToNow();
  }, []);

  const onRefresh = useCallback(async () => {
    await activeControlsRef.current?.refresh();
  }, []);

  const handlePageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const position = e.nativeEvent.position;
      if (position === activeIndex) {
        return;
      }
      setSelectedCruiseDay(windowDays[position]);
    },
    [windowDays, activeIndex, setSelectedCruiseDay],
  );

  /**
   * Once the window has recentered on selectedCruiseDay (from either a settled swipe
   * or a header day-chip tap), make sure the pager is sitting on the active slot.
   */
  useEffect(() => {
    pagerRef.current?.setPageWithoutAnimation(activeIndex);
  }, [selectedCruiseDay, activeIndex]);

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
        {windowDays.map((day, idx) => (
          <View key={idx} collapsable={false} style={commonStyles.flex}>
            <DayPlannerPage
              cruiseDay={day}
              isActive={idx === activeIndex}
              onActiveControlsChange={handleActiveControlsChange}
            />
          </View>
        ))}
      </PagerView>
      {!preRegistrationMode && <ScheduleDayPlannerFAB cruiseDay={selectedCruiseDay} />}
    </AppView>
  );
};
