import axios from 'axios';
import {useTokenAuthMutation} from '../TokenAuthMutation';

const queryHandler = async () => {
  return await axios.post('/auth/logout');
};

export const useLogoutMutation = (options = {}) => {
  return useTokenAuthMutation(queryHandler, options);
};
