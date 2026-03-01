import React, {PropsWithChildren} from 'react';

import {ForumFilterProvider} from '#src/Context/Providers/ForumFilterProvider';
import {LfgFilterProvider} from '#src/Context/Providers/LfgFilterProvider';
import {ScheduleFilterProvider} from '#src/Context/Providers/ScheduleFilterProvider';

/**
 * Central FilterProvider that nests all feature-specific filter providers.
 * This is the single location for all filter-related providers in the app.
 * To add a new filter provider, simply nest it here.
 */
export const FilterProvider = ({children}: PropsWithChildren) => {
  return (
    <LfgFilterProvider>
      <ScheduleFilterProvider>
        <ForumFilterProvider>{children}</ForumFilterProvider>
      </ScheduleFilterProvider>
    </LfgFilterProvider>
  );
};
