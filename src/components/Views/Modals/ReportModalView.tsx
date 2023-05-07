import React, {useState} from 'react';
import {FormikHelpers} from 'formik';
import {FezPostData, ProfilePublicData, ReportData} from '../../../libraries/Structs/ControllerStructs';
import {ReportContentForm} from '../../Forms/ReportContentForm';
import {useReportMutation} from '../../Queries/Moderation/ModerationQueries';
import {ReportContentType} from '../../../libraries/Enums/ReportContentType';
import {ReportModalSuccessView} from './ReportModalSuccessView';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

interface ReportModalViewProps {
  profile?: ProfilePublicData;
  fezPost?: FezPostData;
}

export const ReportModalView = ({profile, fezPost}: ReportModalViewProps) => {
  const reportMutation = useReportMutation();
  const [submitted, setSubmitted] = useState(false);
  const {setErrorMessage} = useErrorHandler();

  if (!profile && !fezPost) {
    return <></>;
  }

  const onSubmit = (values: ReportData, formikHelpers: FormikHelpers<ReportData>) => {
    let contentID;
    let contentType;
    if (profile) {
      contentID = profile.header.userID;
      contentType = ReportContentType.users;
    } else if (fezPost) {
      contentID = fezPost.postID;
      contentType = ReportContentType.fezPost;
    }
    reportMutation.mutate(
      {
        contentType: contentType || ReportContentType.fezPost,
        contentID: contentID || 0,
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
