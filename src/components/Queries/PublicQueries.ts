import {usePublicQuery} from './OpenQuery.ts';

export const useConductQuery = () => {
  return usePublicQuery<string>('/public/codeofconduct.md');
};

export const useHelpTextQuery = () => {
  return usePublicQuery<string>('/public/twitarrhelptext.md');
};

export const useFaqQuery = () => {
  return usePublicQuery<string>('/public/faq.md');
};
