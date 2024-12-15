import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';
import {FezChatScreenBase} from '../FezChatScreenBase.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.seamailScreen>;

export const SeamailScreen = ({route}: Props) => {
  return <FezChatScreenBase fezID={route.params.fezID} />;
};
