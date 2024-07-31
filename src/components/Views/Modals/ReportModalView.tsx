import React, {useState} from 'react';
import {FormikHelpers} from 'formik';
import {
  FezData,
  FezPostData,
  ForumData,
  PersonalEventData,
  PhotostreamImageData,
  PostData,
  ProfilePublicData,
  ReportData,
} from '../../../libraries/Structs/ControllerStructs';
import {ReportContentForm} from '../../Forms/ReportContentForm';
import {useReportMutation} from '../../Queries/Moderation/ModerationQueries';
import {ReportContentType} from '../../../libraries/Enums/ReportContentType';
import {ReportModalSuccessView} from './ReportModalSuccessView';
import {ReportModalErrorView} from './ReportModalErrorView';

interface ReportModalViewProps {
  profile?: ProfilePublicData;
  fezPost?: FezPostData;
  fez?: FezData;
  forum?: ForumData;
  forumPost?: PostData;
  photostreamImage?: PhotostreamImageData;
  personalEvent?: PersonalEventData;
}

export const ReportModalView = ({
  profile,
  fezPost,
  fez,
  forumPost,
  forum,
  photostreamImage,
  personalEvent,
}: ReportModalViewProps) => {
  const reportMutation = useReportMutation();
  const [submitted, setSubmitted] = useState(false);

  if (!profile && !fezPost && !fez && !forumPost && !forum && !photostreamImage && !personalEvent) {
    return <ReportModalErrorView />;
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
    } else if (fez) {
      contentID = fez.fezID;
      contentType = ReportContentType.fez;
    } else if (forum) {
      contentID = forum.forumID;
      contentType = ReportContentType.forum;
    } else if (forumPost) {
      contentID = forumPost.postID;
      contentType = ReportContentType.forumPost;
    } else if (photostreamImage) {
      contentID = photostreamImage.postID;
      contentType = ReportContentType.photostreamImage;
    } else if (personalEvent) {
      contentID = personalEvent.personalEventID;
      contentType = ReportContentType.personalEvents;
    }
    reportMutation.mutate(
      {
        contentType: contentType || ReportContentType.fezPost,
        contentID: contentID || 0,
        reportData: values,
      },
      {
        onSuccess: () => {
          formikHelpers.resetForm();
          setSubmitted(true);
        },
        onSettled: () => {
          formikHelpers.setSubmitting(false);
        },
      },
    );
  };

  if (submitted) {
    return <ReportModalSuccessView />;
  }

  return <ReportContentForm onSubmit={onSubmit} />;
};
