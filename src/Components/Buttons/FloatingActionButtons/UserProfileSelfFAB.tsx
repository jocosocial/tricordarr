import * as React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {ProfilePublicData} from '#src/Structs/ControllerStructs';

interface UserProfileSelfFABProps {
  profile: ProfilePublicData;
  showLabel?: boolean;
}

export const UserProfileSelfFAB = ({profile, showLabel}: UserProfileSelfFABProps) => {
  const commonNavigation = useCommonStack();

  return (
    <BaseFAB
      icon={AppIcons.edituser}
      label={'Edit Profile'}
      showLabel={showLabel}
      onPress={() => commonNavigation.push(CommonStackComponents.userProfileEditScreen, {user: profile})}
    />
  );
};
