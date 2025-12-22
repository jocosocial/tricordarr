import {useCommonStack} from '#src/Navigation/CommonScreens';

interface HeaderDayPlannerButtonProps {
  cruiseDay?: number;
}

export const HeaderDayPlannerButton = ({cruiseDay}: HeaderDayPlannerButtonProps) => {
  const commonNavigation = useCommonStack();
};
