import {AppUpdateCard} from '#src/Components/Cards/MainScreen/AppUpdateCard';
import React from 'react';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useClientConfigQuery} from '#src/Queries/Client/ClientQueries';
import DeviceInfo from 'react-native-device-info';
import {compareVersions} from 'compare-versions';

export const TodayAppUpdateView = () => {
  const {data} = useClientConfigQuery();

  if (data && compareVersions(DeviceInfo.getVersion(), data.spec.latestVersion) < 0) {
    return (
      <PaddedContentView>
        <AppUpdateCard latestVersion={data.spec.latestVersion} currentVersion={DeviceInfo.getVersion()} />
      </PaddedContentView>
    );
  }

  return <></>;
};
