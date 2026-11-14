import {differenceInMinutes} from 'date-fns';
import {useCallback} from 'react';

import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {FezType} from '#src/Enums/FezType';
import {FezVisibility} from '#src/Enums/FezVisibility';
import {getApparentCruiseDate} from '#src/Libraries/DateTime';
import {FezData, UserHeader} from '#src/Structs/ControllerStructs';
import {FezFormValues} from '#src/Types/FormValues';

export interface UseFezFormParams {
  /** Cruise day for start date; defaults to adjusted cruise day today when undefined. */
  cruiseDay?: number;
  title?: string;
  info?: string;
  location?: string;
  fezType?: FezType;
  duration?: number | string;
  minCapacity?: number | string;
  maxCapacity?: number | string;
  initialUsers?: UserHeader[];
  /** Defaults to the type's default visibility when undefined. */
  visibility?: FezVisibility;
}

const defaultStartTime = () => ({
  hours: new Date().getHours() + 1,
  minutes: 0,
});

/**
 * Whether these personal event form values can only be saved as a privateEvent, mirroring the
 * Swiftarr rule: a personalEvent has no other participants and can't change from its type's default
 * visibility.
 */
const personalEventRequiresPrivate = (values: FezFormValues): boolean =>
  values.initialUsers.length > 0 || values.visibility === FezVisibility.unlisted;

export interface UseFezFormReturn {
  getInitialValues: (params?: UseFezFormParams) => FezFormValues;
  getInitialValuesFromFez: (fez: FezData) => FezFormValues;
  personalEventRequiresPrivate: (values: FezFormValues) => boolean;
}

/**
 * Returns getInitialValues for create flows. Deduplicates cruise date,
 * start time, and capacity/duration defaults used by LfgCreateScreenBase and
 * PersonalEventCreateScreen. Also shares the personal event type rule between the personal event
 * create and edit flows.
 */
export const useFezForm = (): UseFezFormReturn => {
  const {startDate, adjustedCruiseDayToday} = useCruise();

  const getInitialValues = useCallback(
    (params: UseFezFormParams = {}) => {
      const {
        cruiseDay,
        title = '',
        info = '',
        location = '',
        fezType = FezType.activity,
        duration = 30,
        minCapacity = 0,
        maxCapacity = 0,
        initialUsers = [],
        visibility = FezVisibility.getDefault(fezType),
      } = params;
      const effectiveCruiseDay = cruiseDay !== undefined ? cruiseDay : adjustedCruiseDayToday;
      return {
        title,
        location,
        fezType,
        visibility,
        startDate: getApparentCruiseDate(startDate, effectiveCruiseDay),
        duration: String(duration),
        minCapacity: String(minCapacity),
        maxCapacity: String(maxCapacity),
        info,
        startTime: defaultStartTime(),
        initialUsers,
      };
    },
    [startDate, adjustedCruiseDayToday],
  );

  const getInitialValuesFromFez = useCallback((fez: FezData) => {
    const fezStartDate = new Date(fez.startTime || new Date());
    const fezEndDate = new Date(fez.endTime || new Date());
    const durationMinutes = differenceInMinutes(fezEndDate, fezStartDate);
    return {
      title: fez.title,
      location: fez.location,
      fezType: fez.fezType,
      visibility: fez.visibility,
      startDate: fezStartDate,
      duration: durationMinutes.toString(),
      minCapacity: fez.minParticipants.toString(),
      maxCapacity: fez.maxParticipants.toString(),
      info: fez.info,
      startTime: {hours: fezStartDate.getHours(), minutes: fezStartDate.getMinutes()},
      initialUsers: [],
    };
  }, []);

  return {getInitialValues, getInitialValuesFromFez, personalEventRequiresPrivate};
};
