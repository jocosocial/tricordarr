import {ReportData} from '#src/Structs/ControllerStructs';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';

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
