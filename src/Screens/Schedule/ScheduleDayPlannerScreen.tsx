import {StackScreenProps} from '@react-navigation/stack';
import {useState} from 'react';
import {Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackParamList} from '#src/Navigation/CommonScreens';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.scheduleDayPlannerScreen>;

export const ScheduleDayPlannerScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.schedule} urlPath={'/dayplanner'}>
        <ScheduleDayPlannerScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const ScheduleDayPlannerScreenInner = ({route}: Props) => {
  const {adjustedCruiseDayToday} = useCruise();
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(route.params?.cruiseDay ?? adjustedCruiseDayToday);

  return (
    <AppView>
      <ScheduleHeaderView selectedCruiseDay={selectedCruiseDay} setCruiseDay={setSelectedCruiseDay} />
      <Text>Day Planner for Cruise Day {selectedCruiseDay}</Text>
    </AppView>
  );
};
