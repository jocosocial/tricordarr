import {Formik, FormikHelpers, FormikProps} from 'formik';
import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import * as Yup from 'yup';

import {SubmitIconButton} from '#src/Components/Buttons/IconButtons/SubmitIconButton';
import {EmojiPickerField} from '#src/Components/Forms/Fields/EmojiPickerField';
import {MentionTextField} from '#src/Components/Forms/Fields/MentionTextField';
import {ContentInsertMenuView} from '#src/Components/Views/Content/ContentInsertMenuView';
import {ContentInsertPhotosView} from '#src/Components/Views/Content/ContentInsertPhotosView';
import {ContentPostLengthView} from '#src/Components/Views/Content/ContentPostLengthView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
import {saveImageQueryToLocal} from '#src/Libraries/Storage/ImageStorage';
import {PostContentData} from '#src/Structs/ControllerStructs';
import {ImageQueryData} from '#src/Types';

interface ContentPostFormProps {
  onSubmit: (values: PostContentData, formikBag: FormikHelpers<PostContentData>) => void;
  formRef?: React.RefObject<FormikProps<PostContentData> | null>;
  onPress?: () => void;
  overrideSubmitting?: boolean;
  enablePhotos?: boolean;
  maxLength?: number;
  maxPhotos?: number;
  initialValues?: PostContentData;
  disabled?: boolean;
}

// https://formik.org/docs/guides/react-native
export const ContentPostForm = ({
  onSubmit,
  formRef,
  onPress,
  overrideSubmitting,
  enablePhotos = true,
  maxLength = 500,
  maxPhotos = 1,
  initialValues,
  disabled = false,
}: ContentPostFormProps) => {
  const {commonStyles} = useStyles();
  const {asPrivilegedUser} = usePrivilege();
  const {appConfig} = useConfig();
  const [insertMenuVisible, setInsertMenuVisible] = React.useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = React.useState(false);

  const handleSubmitWithPhotoSave = async (values: PostContentData, formikBag: FormikHelpers<PostContentData>) => {
    // Save photos taken with camera to camera roll if enabled
    if (enablePhotos && appConfig.userPreferences.autosavePhotos) {
      for (const imageData of values.images) {
        // Only save images that were taken with the camera (_shouldSaveToRoll flag)
        // This avoids re-saving images picked from the gallery
        if (imageData.image && imageData._shouldSaveToRoll) {
          await saveImageQueryToLocal(ImageQueryData.fromData(imageData.image));
        }
      }
    }

    // Call the original onSubmit handler
    onSubmit(values, formikBag);
  };

  const validationSchema = Yup.object().shape({
    text: Yup.string()
      .required('Post is required.')
      .min(1, 'Post cannot be empty.')
      .max(maxLength, 'Post must be less than 500 characters.')
      .test('maxLines', 'Post must be less than 25 lines', value => {
        return value.split(/\r\n|\r|\n/).length <= 25;
      }),
  });

  const defaultInitialValues: PostContentData = {
    images: [],
    postAsModerator: asPrivilegedUser === PrivilegedUserAccounts.moderator,
    postAsTwitarrTeam: asPrivilegedUser === PrivilegedUserAccounts.TwitarrTeam,
    text: '',
  };

  const styles = StyleSheet.create({
    formOuterContainer: {
      maxHeight: 300, // this number seemed good so I went with it
    },
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
      ...commonStyles.onSecondaryContainer,
      // Needed for iOS
      ...commonStyles.paddingVerticalSmall,
    },
    lengthHintContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
      ...commonStyles.marginBottomSmall,
    },
    inputWrapperViewSide: {
      ...commonStyles.flexColumn,
      ...commonStyles.flexEnd,
    },
  });

  const handleInsertPress = () => {
    if (emojiPickerVisible || insertMenuVisible) {
      setEmojiPickerVisible(false);
      setInsertMenuVisible(false);
      return;
    }
    setInsertMenuVisible(!insertMenuVisible);
  };

  // #152 Used to use enableReinitialize={true} to reset the form
  // if the asPrivilegedUser changed. But that wiped out anything
  // the user had typed or attached.
  useEffect(() => {
    if (formRef?.current) {
      console.log('[ContentPostForm.tsx] updating privilege user Formik context.');
      formRef.current.values.postAsModerator = asPrivilegedUser === PrivilegedUserAccounts.moderator;
      formRef.current.values.postAsTwitarrTeam = asPrivilegedUser === PrivilegedUserAccounts.TwitarrTeam;
    }
  }, [asPrivilegedUser, formRef]);

  // https://formik.org/docs/api/withFormik
  // https://www.programcreek.com/typescript/?api=formik.FormikHelpers
  // https://formik.org/docs/guides/react-native
  //
  // This uses the native TextInput rather than Paper since Paper's was way more
  // annoying to try and stylize for this use.
  // At least I used to until I switched to the MentionsInput.
  return (
    <Formik
      innerRef={formRef}
      initialValues={initialValues || defaultInitialValues}
      onSubmit={handleSubmitWithPhotoSave}
      validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, dirty, isValid}) => (
        <View style={styles.formOuterContainer}>
          <ScrollView keyboardShouldPersistTaps={'always'} bounces={false}>
            <View style={styles.formContainer}>
              {emojiPickerVisible && <EmojiPickerField />}
              <ContentInsertMenuView
                enablePhotos={enablePhotos}
                visible={insertMenuVisible}
                setVisible={setInsertMenuVisible}
                setEmojiVisible={setEmojiPickerVisible}
                maxPhotos={maxPhotos}
              />
              <View style={styles.formView}>
                <View style={styles.inputWrapperViewSide}>
                  <IconButton
                    icon={emojiPickerVisible || insertMenuVisible ? AppIcons.insertClose : AppIcons.insert}
                    onPress={handleInsertPress}
                  />
                </View>
                <View style={styles.inputWrapperView}>
                  <MentionTextField name={'text'} style={styles.input} />
                  <ContentInsertPhotosView />
                </View>
                <View style={styles.inputWrapperViewSide}>
                  <SubmitIconButton
                    disabled={disabled || !values.text || !isValid}
                    submitting={overrideSubmitting || isSubmitting}
                    onPress={onPress || handleSubmit}
                    withPrivilegeColors={true}
                  />
                </View>
              </View>
              {dirty && <ContentPostLengthView content={values.text} maxChars={maxLength} />}
            </View>
          </ScrollView>
        </View>
      )}
    </Formik>
  );
};
