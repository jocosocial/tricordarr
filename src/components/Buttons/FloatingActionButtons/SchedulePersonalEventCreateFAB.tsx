import {BaseFAB} from './BaseFAB.tsx';
import {useScheduleStackNavigation} from '#src/Components/Navigation/Stacks/ScheduleStackNavigator.tsx';
import {CommonStackComponents} from '#src/Components/Navigation/CommonScreens.tsx';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';

export const SchedulePersonalEventCreateFAB = () => {
  const navigation = useScheduleStackNavigation();
  return (
    <BaseFAB
      onPress={() => navigation.push(CommonStackComponents.personalEventCreateScreen, {})}
      icon={AppIcons.eventCreate}
      label={'New Event'}
    />
  );
};
