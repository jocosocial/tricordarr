import {useTokenAuthMutation} from '../TokenAuthMutation';
import axios, {AxiosResponse} from 'axios/index';
import {NoteCreateData, NoteData} from '../../../libraries/Structs/ControllerStructs';

interface UserNoteCreateMutationProps {
  userID: string;
  noteData: NoteCreateData;
}

const createQueryHandler = async ({
  userID,
  noteData,
}: UserNoteCreateMutationProps): Promise<AxiosResponse<NoteData>> => {
  return await axios.post(`/users/${userID}/note`, noteData);
};

export const useUserNoteCreateMutation = () => {
  return useTokenAuthMutation(createQueryHandler);
};

const deleteQueryHandler = async ({userID}: {userID: string}): Promise<AxiosResponse<void>> => {
  return await axios.delete(`/users/${userID}/note`);
};

export const useUserNoteDeleteMutation = () => {
  return useTokenAuthMutation(deleteQueryHandler);
};
