import {useTokenAuthMutation} from '../TokenAuthMutation';
import {AxiosResponse} from 'axios';
import {NoteCreateData, NoteData} from '../../../libraries/Structs/ControllerStructs';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface UserNoteCreateMutationProps {
  userID: string;
  noteData: NoteCreateData;
}

export const useUserNoteCreateMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const createQueryHandler = async ({
    userID,
    noteData,
  }: UserNoteCreateMutationProps): Promise<AxiosResponse<NoteData>> => {
    return await ServerQueryClient.post(`/users/${userID}/note`, noteData);
  };

  return useTokenAuthMutation(createQueryHandler);
};

export const useUserNoteDeleteMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const deleteQueryHandler = async ({userID}: {userID: string}): Promise<AxiosResponse<void>> => {
    return await ServerQueryClient.delete(`/users/${userID}/note`);
  };

  return useTokenAuthMutation(deleteQueryHandler);
};
