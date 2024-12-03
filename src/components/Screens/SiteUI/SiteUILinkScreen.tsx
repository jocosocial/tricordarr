import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {SiteUIScreenBase} from './SiteUIScreenBase.tsx';

type Props = NativeStackScreenProps<CommonStackParamList>;

export const SiteUILinkScreen = ({route}: Props) => {
  const {appConfig} = useConfig();
  return <SiteUIScreenBase initialUrl={`${appConfig.serverUrl}/${route.path}`} />;
};
