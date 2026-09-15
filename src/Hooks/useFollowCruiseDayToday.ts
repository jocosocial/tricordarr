import {useEffect, useRef} from 'react';

import {useCruise} from '#src/Context/Contexts/CruiseContext';

/**
 * When cruise "today" rolls over, advance the selected day if the user was still viewing the previous today.
 *
 * `adjustedCruiseDayToday` updates on midnight, the 3 AM late-day flip, and AppState foreground resume.
 * Screens that stay mounted (tab navigators) would otherwise keep a one-shot `useState` from the previous day.
 * Does not override All Days (0) or a day the user picked. See https://github.com/jocosocial/tricordarr/issues/493
 *
 * @param selectedCruiseDay Currently selected cruise day (1-indexed, or 0 for All Days).
 * @param onFollowToday Called with the new today when the selection should follow the rollover.
 */
export function useFollowCruiseDayToday(selectedCruiseDay: number, onFollowToday: (day: number) => void) {
  const {adjustedCruiseDayToday} = useCruise();
  const previousTodayRef = useRef(adjustedCruiseDayToday);

  useEffect(() => {
    const previousToday = previousTodayRef.current;
    if (adjustedCruiseDayToday === previousToday) {
      return;
    }
    previousTodayRef.current = adjustedCruiseDayToday;
    if (selectedCruiseDay === previousToday && adjustedCruiseDayToday) {
      onFollowToday(adjustedCruiseDayToday);
    }
  }, [adjustedCruiseDayToday, selectedCruiseDay, onFollowToday]);
}
