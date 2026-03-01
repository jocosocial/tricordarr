import {ModeratorCard} from '#src/Components/Cards/MainScreen/ModeratorCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';

export const TodayModeratorView = () => {
  const {hasModerator} = usePrivilege();
  const {preRegistrationMode} = usePreRegistration();

  if (preRegistrationMode || !hasModerator) {
    return <></>;
  }

  return (
    <PaddedContentView>
      <ModeratorCard />
    </PaddedContentView>
  );
};
