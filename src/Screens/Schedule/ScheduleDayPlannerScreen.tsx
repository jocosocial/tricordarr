import {StackScreenProps} from '@react-navigation/stack';

import {DayPlannerPagerView} from '#src/Components/Views/Schedule/DayPlannerPagerView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.scheduleDayPlannerScreen>;

/**
 * The user's own Day Planner: followed events, joined LFGs and private events on a timeline, one page per cruise day.
 */
export const ScheduleDayPlannerScreen = (_props: Props) => {
  return (
    <LoggedInScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={'/dayplanner'}>
        <DayPlannerPagerView variant={'personal'} />
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};
