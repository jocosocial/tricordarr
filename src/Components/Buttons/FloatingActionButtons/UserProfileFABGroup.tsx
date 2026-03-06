import * as React from 'react';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {ProfilePublicData} from '#src/Structs/ControllerStructs';

interface UserProfileFABGroupProps {
  profile: ProfilePublicData;
  showLabel?: boolean;
}

export const UserProfileFABGroup = ({profile, showLabel}: UserProfileFABGroupProps) => {
  const commonNavigation = useCommonStack();

  const actions = [
    FabGroupAction({
      icon: AppIcons.seamailCreate,
      label: 'Seamail',
      onPress: () =>
        commonNavigation.push(CommonStackComponents.seamailCreateScreen, {
          initialUserHeaders: [profile.header],
        }),
    }),
    FabGroupAction({
      icon: AppIcons.krakentalkCreate,
      label: 'Call',
      onPress: () =>
        commonNavigation.push(CommonStackComponents.krakenTalkCreateScreen, {
          initialUserHeader: profile.header,
        }),
    }),
    FabGroupAction({
      icon: AppIcons.eventCreate,
      label: 'Private Event',
      onPress: () =>
        commonNavigation.push(CommonStackComponents.personalEventCreateScreen, {
          initialUserHeaders: [profile.header],
        }),
    }),
    FabGroupAction({
      icon: AppIcons.privateNoteEdit,
      label: 'Private Note',
      onPress: () =>
        commonNavigation.push(CommonStackComponents.userPrivateNoteScreen, {
          user: profile,
        }),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={'User Profile'} icon={AppIcons.user} showLabel={showLabel} />;
};
