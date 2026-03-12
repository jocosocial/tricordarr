import {compareVersions} from 'compare-versions';
import React from 'react';
import DeviceInfo from 'react-native-device-info';

import {AppUpdateCard} from '#src/Components/Cards/MainScreen/AppUpdateCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useClientConfig} from '#src/Hooks/useClientConfig';

export const TodayAppUpdateView = () => {
  const {data} = useClientConfig();
  const currentVersion = DeviceInfo.getVersion();
  const latestVersion = data?.spec.latestVersion;

  if (!latestVersion) {
    return null;
  }

  try {
    if (compareVersions(currentVersion, latestVersion) < 0) {
      return (
        <PaddedContentView>
          <AppUpdateCard latestVersion={latestVersion} currentVersion={currentVersion} />
        </PaddedContentView>
      );
    }
  } catch {
    return null;
  }

  return null;
};
