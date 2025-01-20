import {usePublicQuery} from './OpenQuery.ts';
import {useConfig} from '../Context/Contexts/ConfigContext';

export const useConductQuery = () => {
  return usePublicQuery<string>('/public/codeofconduct.md');
};

export const useHelpTextQuery = () => {
  const {appConfig} = useConfig();
  return usePublicQuery<string>(`${appConfig.serverUrl}/public/twitarrhelptext.md`);
};

export const useFaqQuery = () => {
  const {appConfig} = useConfig();
  return usePublicQuery<string>(`${appConfig.serverUrl}/public/faq.md`);
};
