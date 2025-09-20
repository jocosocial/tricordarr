import React, {useState} from 'react';
import {FormikHelpers} from 'formik';
import {
  FezData,
  FezPostData,
  ForumData,
  PhotostreamImageData,
  PostData,
  ProfilePublicData,
  ReportData,
} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {ReportContentForm} from '#src/Components/Forms/ReportContentForm.tsx';
import {useReportMutation} from '#src/Components/Queries/Moderation/ModerationMutations.ts';
import {ReportContentType} from '#src/Libraries/Enums/ReportContentType.ts';
import {ReportModalSuccessView} from './ReportModalSuccessView.tsx';
import {ReportModalErrorView} from './ReportModalErrorView.tsx';

interface ReportModalViewProps {
  profile?: ProfilePublicData;
  fezPost?: FezPostData;
  fez?: FezData;
  forum?: ForumData;
  forumPost?: PostData;
  photostreamImage?: PhotostreamImageData;
}

export const ReportModalView = ({profile, fezPost, fez, forumPost, forum, photostreamImage}: ReportModalViewProps) => {
  const reportMutation = useReportMutation();
  const [submitted, setSubmitted] = useState(false);

  if (!profile && !fezPost && !fez && !forumPost && !forum && !photostreamImage) {
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
