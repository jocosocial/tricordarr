import {FezFormValues} from '../../Libraries/Types/FormValues.ts';
import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import {DateValidation, InfoStringValidation} from '../../Libraries/ValidationSchema.ts';
import {DirtyDetectionField} from './Fields/DirtyDetectionField.tsx';
import {TextField} from './Fields/TextField.tsx';
import React from 'react';
import {Keyboard, View} from 'react-native';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton.tsx';
import {DatePickerField} from './Fields/DatePickerField.tsx';
import {TimePickerField} from './Fields/TimePickerField.tsx';
import {DurationPickerField} from './Fields/DurationPickerField.tsx';
import {TextInput} from 'react-native-paper';
import {AppIcons} from '../../Libraries/Enums/Icons.ts';
import {HelpModalView} from '../Views/Modals/HelpModalView.tsx';
import {useModal} from '../Context/Contexts/ModalContext.ts';
import {UserChipsField} from './Fields/UserChipsField.tsx';
import {SuggestedTextField} from './Fields/SuggestedTextField.tsx';
import {getUserSuggestedLocations} from '../../Libraries/Ship.ts';
import {useUserProfileQuery} from '../Queries/User/UserQueries.ts';

interface PersonalEventFormProps {
  onSubmit: (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => void;
  initialValues: FezFormValues;
  buttonText?: string;
  create?: boolean;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
  startDate: DateValidation,
  info: InfoStringValidation,
  location: InfoStringValidation,
});

const locationHelpContent = [
  "Personal Events are not a reservation system. You can't claim a room or even a table by scheduling an event there.",
];

export const PersonalEventForm = ({
  onSubmit,
  initialValues,
  buttonText = 'Save',
  create = true,
}: PersonalEventFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };
  const {setModalVisible, setModalContent} = useModal();
  const {data: profilePublicData} = useUserProfileQuery();

  const handleLocationInfo = () => {
    Keyboard.dismiss();
    setModalContent(<HelpModalView title={'About Locations'} text={locationHelpContent} />);
    setModalVisible(true);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid, dirty}) => (
        <View>
          <DirtyDetectionField />
          <TextField viewStyle={styles.inputContainer} name={'title'} label={'Title'} />
          <TextField
            viewStyle={styles.inputContainer}
            name={'info'}
            label={'Info'}
            multiline={true}
            numberOfLines={3}
          />
          <SuggestedTextField
            viewStyle={styles.inputContainer}
            name={'location'}
            label={'Location'}
            autoCapitalize={'words'}
            right={<TextInput.Icon icon={AppIcons.info} onPress={handleLocationInfo} disabled={isSubmitting} />}
            suggestions={getUserSuggestedLocations(profilePublicData)}
          />
          <View style={[commonStyles.paddingBottom]}>
            <DatePickerField name={'startDate'} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <TimePickerField name={'startTime'} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <DurationPickerField name={'duration'} label={'Duration'} value={values.duration} />
          </View>
          {create && (
            <View style={[commonStyles.paddingBottom]}>
              <UserChipsField name={'initialUsers'} label={'Participants (Optional)'} />
            </View>
          )}
          <PrimaryActionButton
            disabled={!values.title || isSubmitting || !isValid || !dirty}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={buttonText}
          />
        </View>
      )}
    </Formik>
  );
};
