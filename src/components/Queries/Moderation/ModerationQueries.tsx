import axios, {AxiosError, AxiosResponse} from 'axios';
import {useMutation} from '@tanstack/react-query';
import {ErrorResponse, ReportData} from '../../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {ReportContentType} from '../../../libraries/Enums/ReportContentType';

interface ModReportMutationProps {
  contentType: ReportContentType;
  contentID: string | number;
  reportData: ReportData;
}

const queryHandler = async ({
  contentType,
  contentID,
  reportData,
}: ModReportMutationProps): Promise<AxiosResponse<void>> => {
  return await axios.post(`/${contentType}/${contentID}/report`, reportData);
};

export const useReportMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<void>, AxiosError<ErrorResponse>, ModReportMutationProps>(queryHandler, {
    retry: retry,
    onError: error => {
      setErrorMessage(error.response?.data.reason);
    },
  });
};
