import {ReportData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {ReportContentType} from '../../../Libraries/Enums/ReportContentType.ts';
import {useTokenAuthMutation} from '../TokenAuthMutation.ts';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ModReportMutationProps {
  contentType: ReportContentType;
  contentID: string | number;
  reportData: ReportData;
}

export const useReportMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({contentType, contentID, reportData}: ModReportMutationProps) => {
    return await apiPost<void, ReportData>(`/${contentType}/${contentID}/report`, reportData);
  };

  return useTokenAuthMutation(queryHandler);
};
