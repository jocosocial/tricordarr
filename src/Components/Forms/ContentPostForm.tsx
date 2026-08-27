import {Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik';
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
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
import {createLogger} from '#src/Libraries/Logger';
import {saveImageQueryToLocal} from '#src/Libraries/Storage/ImageStorage';
import {PostContentData} from '#src/Structs/ControllerStructs';
import {ImageQueryData} from '#src/Types';

const logger = createLogger('ContentPostForm.tsx');

/**
 * Maps the current elevation account to the privilege flags the API expects on a post.
 */
const getPrivilegeFlags = (asPrivilegedUser?: keyof typeof PrivilegedUserAccounts) => ({
  postAsModerator: asPrivilegedUser === PrivilegedUserAccounts.moderator,
  postAsTwitarrTeam: asPrivilegedUser === PrivilegedUserAccounts.TwitarrTeam,
});

/**
 * Copies current elevation into Formik privilege flags without reinitializing the form
 * (which would wipe typed text and attached photos). See #152 / #525.
 */
const ElevationPrivilegeSync = () => {
  const {setFieldValue} = useFormikContext<PostContentData>();
  const {asPrivilegedUser} = useElevation();

  useEffect(() => {
    logger.debug('Updating privilege user Formik context.');
    const flags = getPrivilegeFlags(asPrivilegedUser);
    setFieldValue('postAsModerator', flags.postAsModerator);
    setFieldValue('postAsTwitarrTeam', flags.postAsTwitarrTeam);
  }, [asPrivilegedUser, setFieldValue]);

  return null;
};

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
  const {asPrivilegedUser} = useElevation();
  const {appConfig} = useConfig();
  const [insertMenuVisible, setInsertMenuVisible] = React.useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = React.useState(false);

  /**
   * Saves camera photos if needed, then submits with privilege flags taken from
   * elevation rather than stale Formik state.
   */
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

    onSubmit(
      {
        ...values,
        ...getPrivilegeFlags(asPrivilegedUser),
      },
      formikBag,
    );
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
    ...getPrivilegeFlags(asPrivilegedUser),
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
          <ElevationPrivilegeSync />
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
                    testID={'contentPostInsert-button'}
                    icon={emojiPickerVisible || insertMenuVisible ? AppIcons.insertClose : AppIcons.insert}
                    onPress={handleInsertPress}
                  />
                </View>
                <View style={styles.inputWrapperView}>
                  <MentionTextField name={'text'} testID={'contentPostText-input'} style={styles.input} />
                  <ContentInsertPhotosView />
                </View>
                <View style={styles.inputWrapperViewSide}>
                  <SubmitIconButton
                    disabled={disabled || !values.text || !isValid}
                    submitting={overrideSubmitting || isSubmitting}
                    onPress={onPress || handleSubmit}
                    withPrivilegeColors={true}
                    testID={'contentPostSubmit-button'}
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
