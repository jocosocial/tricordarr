import React, {PropsWithChildren, useEffect, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {FeatureContext} from '#src/Context/Contexts/FeatureContext';
import {SwiftarrClientApp, SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {DisabledFeature} from '#src/Structs/ControllerStructs';

export const FeatureProvider = ({children}: PropsWithChildren) => {
  const {oobeCompleted} = useConfig();
  const [disabledFeatures, setDisabledFeatures] = useState<SwiftarrFeature[]>([]);
  const [allDisabledFeatures, setAllDisabledFeatures] = useState<DisabledFeature[]>([]);
  const {data: userNotificationData} = useUserNotificationDataQuery({enabled: oobeCompleted});

  useEffect(() => {
    if (userNotificationData) {
      // Store all disabled features for app-specific checks
      setAllDisabledFeatures(userNotificationData.disabledFeatures);

      // Store filtered features for default behavior (tricordarr or all)
      const ourFeatures = userNotificationData.disabledFeatures
        .filter(disabledFeature => {
          if (
            disabledFeature.appName === SwiftarrClientApp.tricordarr ||
            disabledFeature.appName === SwiftarrClientApp.all
          ) {
            return disabledFeature.featureName;
          }
        })
        .map(disabledFeature => {
          return disabledFeature.featureName;
        });
      setDisabledFeatures(ourFeatures);
    }
  }, [userNotificationData]);

  const getIsDisabled = (feature: SwiftarrFeature, clientApp?: SwiftarrClientApp) => {
    // If no client app specified, use default behavior (check filtered array)
    if (clientApp === undefined) {
      return disabledFeatures.includes(feature) || disabledFeatures.includes(SwiftarrFeature.all);
    }

    // If client app specified, check if feature is disabled for that app or for all apps
    return allDisabledFeatures.some(
      disabledFeature =>
        (disabledFeature.featureName === feature || disabledFeature.featureName === SwiftarrFeature.all) &&
        (disabledFeature.appName === clientApp || disabledFeature.appName === SwiftarrClientApp.all),
    );
  };

  return (
    <FeatureContext.Provider
      value={{
        disabledFeatures,
        setDisabledFeatures,
        getIsDisabled,
      }}>
      {children}
    </FeatureContext.Provider>
  );
};
