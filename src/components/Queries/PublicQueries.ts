import {useOpenQuery} from './OpenQuery';
import {ConductDoc} from '../../libraries/Structs/SiteStructs';
import {useConfig} from '../Context/Contexts/ConfigContext';

export const useConductQuery = () => {
  const {appConfig} = useConfig();
  return useOpenQuery<ConductDoc>({
    queryKey: [`${appConfig.serverUrl}/public/codeofconduct.json`],
    enabled: true,
  });
};
