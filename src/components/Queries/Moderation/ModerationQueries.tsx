import axios, {AxiosResponse} from 'axios';
import {ReportData} from '../../../libraries/Structs/ControllerStructs';
import {ReportContentType} from '../../../libraries/Enums/ReportContentType';
import {useTokenAuthMutation} from '../TokenAuthMutation';

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

export const useReportMutation = () => {
  return useTokenAuthMutation(queryHandler);
};
