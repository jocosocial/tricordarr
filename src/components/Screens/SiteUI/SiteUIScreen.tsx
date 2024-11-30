import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {SiteUIScreenBase} from './SiteUIScreenBase.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.siteUIScreen>;

export const SiteUIScreen = ({route}: Props) => {
  const {appConfig} = useConfig();

  const getInitialUrl = () => {
    let newUrl = appConfig.serverUrl;

    if (route.params.moderate) {
      newUrl += '/moderate';
    } else if (route.params.admin) {
      newUrl += '/admin';
    }

    if (route?.params?.resource) {
      newUrl += `/${route.params.resource}`;

      if (route.params.id) {
        newUrl += `/${route.params.id}`;
      }
    }
    return newUrl;
  };

  return <SiteUIScreenBase initialUrl={getInitialUrl()} initialKey={route.params.timestamp} />;
};
