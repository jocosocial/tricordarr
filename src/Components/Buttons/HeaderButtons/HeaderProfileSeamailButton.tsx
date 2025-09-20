import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {ProfilePublicData} from '#src/Structs/ControllerStructs';

interface HeaderProfileSeamailButtonProps {
  profile: ProfilePublicData;
}

export const HeaderProfileSeamailButton = (props: HeaderProfileSeamailButtonProps) => {
  const commonNavigation = useCommonStack();
  const seamailCreateHandler = () => {
    commonNavigation.push(CommonStackComponents.seamailCreateScreen, {
      initialUserHeader: props.profile.header,
    });
  };
  return <Item title={'Create Seamail'} iconName={AppIcons.seamailCreate} onPress={seamailCreateHandler} />;
};
