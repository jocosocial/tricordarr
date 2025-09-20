import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackParamList} from '#src/Navigation/CommonScreens';
import {SiteUIScreenBase} from '#src/Screens/SiteUI/SiteUIScreenBase';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';

type Props = NativeStackScreenProps<CommonStackParamList>;

export const SiteUILinkScreen = ({route}: Props) => {
  const {serverUrl} = useSwiftarrQueryClient();
  return <SiteUIScreenBase initialUrl={`${serverUrl}/${route.path}`} />;
};
