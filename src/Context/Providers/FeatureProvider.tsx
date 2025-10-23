import React, {PropsWithChildren, useEffect, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {FeatureContext} from '#src/Context/Contexts/FeatureContext';
import {SwiftarrClientApp, SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

export const FeatureProvider = ({children}: PropsWithChildren) => {
  const {oobeCompleted} = useConfig();
  // Default to disabling images since those queries can fire pretty quickly. Once the state updates
  // from UserNotificationData then the queries will all re-enable and function as expected.
  // Much later on, I don't know why I did that.
  const [disabledFeatures, setDisabledFeatures] = useState<SwiftarrFeature[]>([]);
  const {data: userNotificationData} = useUserNotificationDataQuery({enabled: oobeCompleted});

  useEffect(() => {
    if (userNotificationData) {
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

  const getIsDisabled = (feature: SwiftarrFeature) => {
    return disabledFeatures.includes(feature) || disabledFeatures.includes(SwiftarrFeature.all);
  };

  return (
    <FeatureContext.Provider
      value={{
        disabledFeatures,
        setDisabledFeatures,
        getIsDisabled,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
};
