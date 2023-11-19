import React from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {useStyles} from '../Context/Contexts/StyleContext';
import {SubmitIconButton} from '../Buttons/IconButtons/SubmitIconButton';
import {PostContentData} from '../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../libraries/Enums/Icons';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {IconButton, Text} from 'react-native-paper';
import {PrivilegedUserAccounts} from '../../libraries/Enums/UserAccessLevel';
import {ContentInsertMenuView} from '../Views/Content/ContentInsertMenuView';
import {PostLengthView} from '../Views/PostLengthView';
import * as Yup from 'yup';

interface FezPostFormProps {
  onSubmit: (values: PostContentData, formikBag: FormikHelpers<PostContentData>) => void;
  formRef?: React.RefObject<FormikProps<PostContentData>>;
  onPress?: () => void;
  overrideSubmitting?: boolean;
}

const validationSchema = Yup.object().shape({
  text: Yup.string()
    .required('Post is required.')
    .min(1, 'Post cannot be empty.')
    .max(500, 'Post must be less than 500 characters.')
    .test('maxLines', 'Post must be less than 25 lines', value => {
      return value.split(/\r\n|\r|\n/).length <= 25;
    }),
});

// https://formik.org/docs/guides/react-native
export const FezPostForm = ({onSubmit, formRef, onPress, overrideSubmitting}: FezPostFormProps) => {
  const {commonStyles} = useStyles();
  const {asPrivilegedUser} = usePrivilege();
  const [insertMenuVisible, setInsertMenuVisible] = React.useState(false);

  const initialValues: PostContentData = {
    images: [],
    postAsModerator: asPrivilegedUser === PrivilegedUserAccounts.moderator,
    postAsTwitarrTeam: asPrivilegedUser === PrivilegedUserAccounts.TwitarrTeam,
    text: '',
  };

  const styles = StyleSheet.create({
    formContainer: {
      ...commonStyles.flexColumn,
    },
    formView: {
      ...commonStyles.flexRow,
      ...commonStyles.marginVerticalSmall,
    },
    inputWrapperView: {
      ...commonStyles.flex,
      ...commonStyles.justifyCenter,
      ...commonStyles.flexColumn,
    },
    input: {
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.paddingHorizontal,
      ...commonStyles.secondaryContainer,
    },
    lengthHintContainer: {
      ...commonStyles.flexRow,
    },
  });

  // https://formik.org/docs/api/withFormik
  // https://www.programcreek.com/typescript/?api=formik.FormikHelpers
  // https://formik.org/docs/guides/react-native
  //
  // This uses the native TextInput rather than Paper since Paper's was way more
  // annoying to try and stylize for this use.
  return (
    <Formik
      innerRef={formRef}
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      {({handleChange, handleBlur, handleSubmit, values, isSubmitting}) => (
        <View style={styles.formContainer}>
          <View style={styles.formView}>
            <IconButton icon={AppIcons.insert} onPress={() => setInsertMenuVisible(!insertMenuVisible)} />
            <View style={styles.inputWrapperView}>
              <TextInput
                underlineColorAndroid={'transparent'}
                style={styles.input}
                multiline={true}
                onChangeText={handleChange('text')}
                onBlur={handleBlur('text')}
                value={values.text}
              />
            </View>
            <SubmitIconButton
              disabled={!values.text}
              submitting={overrideSubmitting || isSubmitting}
              onPress={onPress || handleSubmit}
            />
          </View>
          {/*<View style={styles.lengthHintContainer}>*/}
          {/*  <PostLengthView content={values.text} />*/}
          {/*</View>*/}
          <ContentInsertMenuView visible={insertMenuVisible} setVisible={setInsertMenuVisible} />
        </View>
      )}
    </Formik>
  );
};
