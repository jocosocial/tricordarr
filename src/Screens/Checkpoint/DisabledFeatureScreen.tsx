import {PropsWithChildren, ReactElement} from 'react';

import {DisabledView} from '#src/Components/Views/Static/DisabledView';
import {KrakenView} from '#src/Components/Views/Static/KrakenView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {SwiftarrClientApp, SwiftarrFeature} from '#src/Enums/AppFeatures';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {SiteUIScreenBase} from '#src/Screens/SiteUI/SiteUIScreenBase';

interface DisabledFeatureScreenProps extends PropsWithChildren {
  feature: SwiftarrFeature;
  urlPath?: string;
}

/**
 * Wrapper for screens that are part of disable-able features.
 * This will render an appropriate view based on the disabled state.
 *
 * In a nutshell, if the feature was disabled for the app it will try to use the web.
 */
export const DisabledFeatureScreen = (props: DisabledFeatureScreenProps) => {
  const {getIsDisabled} = useFeature();
  const {appConfig} = useConfig();

  /**
   * Determines which component to render based on which apps have the feature disabled
   * Only returns disabled views if the feature is disabled for tricordarr
   */
  const getDisabledComponent = (): ReactElement | null => {
    const isDisabledForTricordarr = getIsDisabled(props.feature, SwiftarrClientApp.tricordarr);
    const isDisabledForSwiftarr = getIsDisabled(props.feature, SwiftarrClientApp.swiftarr);
    const isDisabledForKraken = getIsDisabled(props.feature, SwiftarrClientApp.kraken);
    const isDisabledForAll = getIsDisabled(props.feature, SwiftarrClientApp.all);

    // If not disabled for tricordarr, return null (will render children)
    if (!isDisabledForTricordarr && !isDisabledForAll) {
      return null;
    }

    // .all or any other combination involving .tricordarr: return DisabledView
    if (isDisabledForAll) {
      return <DisabledView />;
    }

    // .tricordarr and not .swiftarr: return SiteUIScreenBase
    if (props.urlPath && isDisabledForTricordarr && !isDisabledForSwiftarr) {
      return <SiteUIScreenBase initialUrl={`${appConfig.serverUrl}/${props.urlPath}`} />;
    }

    // .tricordarr and .swiftarr and not .kraken: return KrakenView
    if (isIOS && isDisabledForTricordarr && isDisabledForSwiftarr && !isDisabledForKraken) {
      return <KrakenView />;
    }

    // Any other combination involving .tricordarr: return DisabledView
    return <DisabledView />;
  };

  const disabledComponent = getDisabledComponent();
  if (disabledComponent === null) {
    return props.children;
  }

  return disabledComponent;
};
