import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';
import {FezChatScreenBase} from '../FezChatScreenBase.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.lfgChatScreen>;

export const LfgChatScreen = ({route}: Props) => {
  return <FezChatScreenBase fezID={route.params.fezID} />;
};
