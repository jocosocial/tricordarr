import axios, {AxiosResponse} from 'axios';
import {SwiftarrClientConfig} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useTokenAuthMutation} from '../TokenAuthMutation.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';

const clientConfigHandler = async (): Promise<AxiosResponse<SwiftarrClientConfig>> => {
  return await axios.get('/../../public/clients/tricordarr.json', {
    // https://www.reddit.com/r/reactnative/comments/15frmyb/is_axios_caching/
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
};

/**
 * Arguably this is not a mutation. However given the very deterministic
 * nature that I want to consume the results of this function, I'm making
 * it a mutation so that we can be damn sure that the values get updated
 * when expected.
 */
export const useClientConfigMutation = () => {
  const {appConfig, updateAppConfig} = useConfig();
  return useTokenAuthMutation(clientConfigHandler, {
    onSuccess: rsp => {
      const [year, month, day] = rsp.data.spec.cruiseStartDate.split('-').map(Number);
      updateAppConfig({
        ...appConfig,
        cruiseLength: rsp.data.spec.cruiseLength,
        cruiseStartDate: new Date(year, month - 1, day),
        oobeExpectedVersion: rsp.data.spec.oobeVersion,
        portTimeZoneID: rsp.data.spec.portTimeZoneID,
        schedBaseUrl: rsp.data.spec.schedBaseUrl,
      });
    },
  });
};
