import {NavHeaderTitle} from '../../Text/NavHeaderTitle';
import React from 'react';
import {CommonStackComponents, useCommonStack} from '../CommonScreens';
import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FezType} from '../../../libraries/Enums/FezType.ts';

interface FezHeaderTitleProps {
  fez: FezData;
}

const FezHeaderTitle = ({fez}: FezHeaderTitleProps) => {
  const navigation = useCommonStack();
  const onPress = () =>
    navigation.push(CommonStackComponents.seamailDetailsScreen, {
      fezID: fez.fezID,
    });
  return <NavHeaderTitle title={`${FezType.getTitle(fez.fezType)} Chat`} onPress={onPress} />;
};

// This exists to prevent defining the component during render, because the navigator
// requires a () => Element not an Element. Because.... reasons?
export const getSeamailHeaderTitle = (fez: FezData) => () => <FezHeaderTitle fez={fez} />;
