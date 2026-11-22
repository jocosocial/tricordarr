import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {DayPlannerPagerView} from '#src/Components/Views/Schedule/DayPlannerPagerView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {NoAccessScreen} from '#src/Screens/Checkpoint/NoAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.shutternautCalendarScreen>;

/**
 * Shared calendar of every event a Shutternaut has signed up to photograph. Native counterpart to
 * Swiftarr's `/dayplanner/shutternauts`.
 *
 * The access checkpoint matches the API: the `hasPhotographer` filter is only allowed for Shutternauts,
 * Shutternaut Managers, and TwitarrTeam and above. Everyone else would get a 400.
 *
 * No PreRegistrationScreen checkpoint: Swiftarr marks the shared calendar `setUsedForPreregistration()`.
 */
export const ShutternautCalendarScreen = (_props: Props) => {
  const {hasShutternaut, hasShutternautManager} = useRoles();
  const {hasTwitarrTeam} = usePrivilege();

  return (
    <LoggedInScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={'/dayplanner/shutternauts'}>
        <NoAccessScreen hasAccess={hasShutternaut || hasShutternautManager || hasTwitarrTeam}>
          <DayPlannerPagerView variant={'shutternaut'} />
        </NoAccessScreen>
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};
