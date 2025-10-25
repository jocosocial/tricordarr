import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useState} from 'react';
import {Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {CommonStackParamList} from '#src/Navigation/CommonScreens';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.scheduleDayPlannerScreen>;

export const ScheduleDayPlannerScreen = ({route}: Props) => {
  const {adjustedCruiseDayToday} = useCruise();
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(route.params?.cruiseDay ?? adjustedCruiseDayToday);

  return (
    <AppView>
      <ScheduleHeaderView selectedCruiseDay={selectedCruiseDay} setCruiseDay={setSelectedCruiseDay} />
      <Text>Day Planner for Cruise Day {selectedCruiseDay}</Text>
    </AppView>
  );
};
