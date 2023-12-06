import axios, {AxiosResponse} from 'axios';
import {FezPostData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a

interface FezPostMutationProps {
  fezID: string;
  postContentData: PostContentData;
}

const queryHandler = async ({fezID, postContentData}: FezPostMutationProps): Promise<AxiosResponse<FezPostData>> => {
  return await axios.post(`/fez/${fezID}/post`, postContentData);
};

export const useFezPostMutation = () => {
  return useTokenAuthMutation(queryHandler);
};
