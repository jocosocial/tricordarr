import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {CommonStackParamList} from '#src/Navigation/CommonScreens';
import {SiteUIScreenBase} from '#src/Screens/SiteUI/SiteUIScreenBase';

type Props = StackScreenProps<CommonStackParamList>;

export const SiteUILinkScreen = ({route}: Props) => {
  const {serverUrl} = useSwiftarrQueryClient();
  return <SiteUIScreenBase initialUrl={`${serverUrl}/${route.path}`} />;
};
