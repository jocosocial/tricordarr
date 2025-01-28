import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {SiteUIScreenBase} from './SiteUIScreenBase.tsx';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

type Props = NativeStackScreenProps<CommonStackParamList>;

export const SiteUILinkScreen = ({route}: Props) => {
  const {serverUrl} = useSwiftarrQueryClient();
  return <SiteUIScreenBase initialUrl={`${serverUrl}/${route.path}`} />;
};
