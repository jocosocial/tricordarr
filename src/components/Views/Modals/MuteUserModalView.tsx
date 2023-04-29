// import React, {useState} from 'react';
// import {FormikHelpers} from 'formik';
// import {ReportData} from '../../../libraries/Structs/ControllerStructs';
// import {ReportContentType} from '../../../libraries/Enums/ReportContentType';
// import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
// import {useUserMuteMutation} from '../../Queries/Users/Actions/UserMuteQueries';
// import {useStyles} from '../../Context/Contexts/StyleContext';
// import {Text} from 'react-native-paper';
// import {useUserData} from '../../Context/Contexts/UserDataContext';
// import {UserAccessLevel} from '../../../libraries/Enums/UserAccessLevel';
// import {ModalCard} from '../../Cards/ModalCard';
// import {View} from 'react-native';
//
// interface MuteUserModalViewProps {
//   userID: string;
// }
//
// const MuteUserModalContent = () => {
//   const {commonStyles} = useStyles();
//   const {accessLevel} = useUserData();
//
//   return (
//     <>
//       <Text style={[commonStyles.marginBottomSmall]}>Muting a user will hide all that user's content from you.</Text>
//       {UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.moderator) && (
//         <Text style={[commonStyles.marginBottomSmall]}>You're a Moderator. You'll still see their content.</Text>
//       )}
//     </>
//   );
// };
//
// export const MuteUserModalView = ({userID}: MuteUserModalViewProps) => {
//   const muteMutation = useUserMuteMutation();
//   const [submitted, setSubmitted] = useState(false);
//   const {setErrorMessage} = useErrorHandler();
//
//   const onSubmit = (values: ReportData, formikHelpers: FormikHelpers<ReportData>) => {
//     muteMutation.mutate(
//       {
//         userID: userID,
//         contentID: content.header.userID,
//         reportData: values,
//       },
//       {
//         onSuccess: () => {
//           formikHelpers.setSubmitting(false);
//           formikHelpers.resetForm();
//           setSubmitted(true);
//         },
//         onError: error => {
//           formikHelpers.setSubmitting(false);
//           setErrorMessage(error.response?.data.reason);
//         },
//       },
//     );
//   };
//   // if (submitted) {
//   //   return <ReportModalSuccessView />;
//   // }
//
//   // return <ReportContentForm onSubmit={onSubmit} />;
//   return (
//     <View>
//       <ModalCard title={'Mute'} closeButtonText={'Cancel'} content={<MuteUserModalContent />} />
//     </View>
//   );
// };
