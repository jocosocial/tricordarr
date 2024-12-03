import {AxiosResponse} from 'axios';
import {ReportData} from '../../../libraries/Structs/ControllerStructs';
import {ReportContentType} from '../../../libraries/Enums/ReportContentType';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ModReportMutationProps {
  contentType: ReportContentType;
  contentID: string | number;
  reportData: ReportData;
}

export const useReportMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async ({
    contentType,
    contentID,
    reportData,
  }: ModReportMutationProps): Promise<AxiosResponse<void>> => {
    return await ServerQueryClient.post(`/${contentType}/${contentID}/report`, reportData);
  };

  return useTokenAuthMutation(queryHandler);
};
