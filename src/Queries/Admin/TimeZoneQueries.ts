import {UseQueryOptions} from '@tanstack/react-query';
import {AxiosError} from 'axios';

import {STALE} from '#src/Libraries/Time/Time';
import {useOpenQuery} from '#src/Queries/OpenQuery';
import {ErrorResponse, TimeZoneChangeData} from '#src/Structs/ControllerStructs';

type TimeZoneChangesQueryOptions = Omit<
  UseQueryOptions<TimeZoneChangeData, AxiosError<ErrorResponse>, TimeZoneChangeData>,
  'initialData' | 'queryKey'
> & {initialData?: () => undefined};

export const useTimeZoneChangesQuery = (options?: TimeZoneChangesQueryOptions) => {
  return useOpenQuery<TimeZoneChangeData>('/admin/timezonechanges', {
    staleTime: STALE.HOURS.TWENTY_FOUR,
    ...options,
  });
};
