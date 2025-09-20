import {BaseFAB} from './BaseFAB.tsx';
import {useScheduleStackNavigation} from '../../Navigation/Stacks/ScheduleStackNavigator.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';

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
