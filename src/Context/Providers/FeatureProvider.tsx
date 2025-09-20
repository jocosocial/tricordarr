import React, {PropsWithChildren, useEffect, useState} from 'react';
import {SwiftarrClientApp, SwiftarrFeature} from '../../../Libraries/Enums/AppFeatures.ts';
import {FeatureContext} from '../Contexts/FeatureContext.ts';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries.ts';
import {useConfig} from '../Contexts/ConfigContext.ts';

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
      }}>
      {children}
    </FeatureContext.Provider>
  );
};
