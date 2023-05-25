import React from 'react';
import {View, TextInput} from 'react-native';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {useStyles} from '../Context/Contexts/StyleContext';
import {SubmitIconButton} from '../Buttons/IconButtons/SubmitIconButton';
import {PostContentData} from '../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useAppTheme} from '../../styles/Theme';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {IconButton} from 'react-native-paper';
import {PrivilegedUserAccounts} from '../../libraries/Enums/UserAccessLevel';

interface FezPostFormProps {
  onSubmit: (values: PostContentData, formikBag: FormikHelpers<PostContentData>) => void;
  formRef?: React.RefObject<FormikProps<PostContentData>>;
  onPress?: () => void;
  overrideSubmitting?: boolean;
}

// https://formik.org/docs/guides/react-native
export const FezPostForm = ({onSubmit, formRef, onPress, overrideSubmitting}: FezPostFormProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const {asPrivilegedUser} = usePrivilege();

  const initialValues: PostContentData = {
    images: [],
    postAsModerator: asPrivilegedUser === PrivilegedUserAccounts.moderator,
    postAsTwitarrTeam: asPrivilegedUser === PrivilegedUserAccounts.TwitarrTeam,
    text: '',
  };

  const styles = {
    formView: [commonStyles.flexRow, commonStyles.marginVerticalSmall],
    inputWrapperView: [commonStyles.flex, commonStyles.justifyCenter, commonStyles.flexColumn],
    input: [commonStyles.roundedBorderLarge, commonStyles.paddingSides, commonStyles.secondaryContainer],
  };

  // https://formik.org/docs/api/withFormik
  // https://www.programcreek.com/typescript/?api=formik.FormikHelpers
  // https://formik.org/docs/guides/react-native
  //
  // This uses the native TextInput rather than Paper since Paper's was way more
  // annoying to try and stylize for this use.
  return (
    <Formik innerRef={formRef} enableReinitialize={true} initialValues={initialValues} onSubmit={onSubmit}>
      {({handleChange, handleBlur, handleSubmit, values, isSubmitting}) => (
        <View style={styles.formView}>
          <IconButton icon={AppIcons.insert} onPress={() => console.log('insert')} />
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
      )}
    </Formik>
  );
};
