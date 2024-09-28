import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import React from 'react';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';

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
