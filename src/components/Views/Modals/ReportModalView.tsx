import React, {useState} from 'react';
import {FormikHelpers} from 'formik';
import {ProfilePublicData, ReportData} from '../../../libraries/Structs/ControllerStructs';
import {ReportContentForm} from '../../Forms/ReportContentForm';
import {useReportMutation} from '../../Queries/Moderation/ModerationQueries';
import {ReportContentType} from '../../../libraries/Enums/ReportContentType';
import {ReportModalSuccessView} from './ReportModalSuccessView';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

interface ReportModalViewProps {
  content: ProfilePublicData;
}

export const ReportModalView = ({content}: ReportModalViewProps) => {
  const reportMutation = useReportMutation();
  const [submitted, setSubmitted] = useState(false);
  const {setErrorMessage} = useErrorHandler();

  const onSubmit = (values: ReportData, formikHelpers: FormikHelpers<ReportData>) => {
    reportMutation.mutate(
      {
        contentType: ReportContentType.users,
        contentID: content.header.userID,
        reportData: values,
      },
      {
        onSuccess: () => {
          formikHelpers.setSubmitting(false);
          formikHelpers.resetForm();
          setSubmitted(true);
        },
        onError: error => {
          formikHelpers.setSubmitting(false);
          setErrorMessage(error.response?.data.reason);
        },
      },
    );
  };

  if (submitted) {
    return <ReportModalSuccessView />;
  }

  return <ReportContentForm onSubmit={onSubmit} />;
};
