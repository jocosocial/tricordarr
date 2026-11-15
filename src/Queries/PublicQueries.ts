import {useExplicitPublicQuery, usePublicQuery} from '#src/Queries/OpenQuery';

export const useConductQuery = () => {
  return usePublicQuery<string>('/public/codeofconduct.md');
};

/**
 * The code of conduct of an explicit server, independent of the active session.
 */
export const useExplicitServerConductQuery = (serverUrl: string) => {
  return useExplicitPublicQuery<string>(serverUrl, '/public/codeofconduct.md');
};

export const useHelpTextQuery = () => {
  return usePublicQuery<string>('/public/twitarrhelptext.md');
};

export const useFaqQuery = () => {
  return usePublicQuery<string>('/public/faq.md');
};
