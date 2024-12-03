import {AppUpdateCard} from '../Cards/MainScreen/AppUpdateCard.tsx';
import React from 'react';
import {PaddedContentView} from './Content/PaddedContentView.tsx';
import {useClientConfigQuery} from '../Queries/Client/ClientQueries.ts';
import DeviceInfo from 'react-native-device-info';

export const TodayAppUpdateView = () => {
  const {data} = useClientConfigQuery();

  if (data?.spec.latestVersion !== DeviceInfo.getVersion()) {
    return (
      <PaddedContentView>
        <AppUpdateCard />
      </PaddedContentView>
    );
  }

  return <></>;
};
