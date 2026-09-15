import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ProfilePublicData} from '#src/Structs/ControllerStructs';

interface HeaderProfileSeamailButtonProps {
  profile: ProfilePublicData;
}

export const HeaderProfileSeamailButton = (props: HeaderProfileSeamailButtonProps) => {
  const commonNavigation = useCommonStack();
  const seamailCreateHandler = () => {
    commonNavigation.push(CommonStackComponents.seamailCreateScreen, {
      initialUserHeaders: [props.profile.header],
    });
  };
  return (
    <Item
      title={'Create Seamail'}
      iconName={AppIcons.seamailCreate}
      onPress={seamailCreateHandler}
      testID={'headerSeamail-headerButton'}
    />
  );
};
