import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/ScheduleStackNavigator';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {AppIcons} from '#src/Enums/Icons';

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
