import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {Keyboard, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {Text} from 'react-native-paper';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {DatePickerField} from '#src/Components/Forms/Fields/DatePickerField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {DurationPickerField} from '#src/Components/Forms/Fields/DurationPickerField';
import {FezTypePickerField} from '#src/Components/Forms/Fields/FezTypePickerField';
import {SuggestedTextField} from '#src/Components/Forms/Fields/SuggestedTextField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {TimePickerField} from '#src/Components/Forms/Fields/TimePickerField';
import {HelpModalView} from '#src/Components/Views/Modals/HelpModalView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {publicLocationSuggestions} from '#src/Libraries/Ship';
import {
  DateValidation,
  InfoStringValidation,
  LFGTypeValidation,
  NumberValidation,
} from '#src/Libraries/ValidationSchema';
import {FezFormValues} from '#src/Types/FormValues';

interface LfgFormProps {
  onSubmit: (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => void;
  initialValues: FezFormValues;
  buttonText?: string;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
  location: InfoStringValidation,
  info: InfoStringValidation,
  minCapacity: NumberValidation.min(1).max(3),
  maxCapacity: NumberValidation.min(1).max(3),
  fezType: LFGTypeValidation,
  startDate: DateValidation,
});

const LocationHelpModalView = () => {
  const {commonStyles} = useStyles();
  return (
    <ModalCard title={'About LFG Locations'}>
      <Text variant={'titleMedium'}>Guidelines</Text>
      <Text>
        1. LFGs are not a reservation system. You can't claim a room or even a table by scheduling an LFG there.
      </Text>
      <Text>2. Don't set up an LFG in a room used for Official or Shadow Events.</Text>
      <Text>
        3. Don't try to get around Item 2 by scheduling your LFG in an Event room at a time when the Official Schedule
        doesn't list anything happening there. Event rooms are often used for official things even when not running a
        listed event.
      </Text>
      <Text>
        4. Sometimes places fill up; have backup plans. If you schedule a "Drink Like a Pirate" LFG at a bar onboard,
        and that bar's full at the appointed time, you can message the LFG members to relocate.
      </Text>
      <Text variant={'titleMedium'} style={commonStyles.marginTopSmall}>
        Tips & Advice
      </Text>
      <Text>
        The locations in the menu are suggestions. You can type in any location you want (subject to the rules above).
      </Text>
    </ModalCard>
  );
};

const maximumHelpContent = ['Use 0 for unlimited'];

export const LfgForm = ({onSubmit, initialValues, buttonText = 'Create'}: LfgFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };
  const {setModalVisible, setModalContent} = useModal();

  const handleLocationInfo = () => {
    Keyboard.dismiss();
    setModalContent(<LocationHelpModalView />);
    setModalVisible(true);
  };

  const handleMaxInfo = () => {
    Keyboard.dismiss();
    setModalContent(<HelpModalView title={'About Participation'} text={maximumHelpContent} />);
    setModalVisible(true);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid}) => (
        <View>
          <DirtyDetectionField />
          <TextField viewStyle={styles.inputContainer} name={'title'} label={'Title'} autoCapitalize={'words'} />
          <SuggestedTextField
            viewStyle={styles.inputContainer}
            name={'location'}
            label={'Location'}
            right={<TextInput.Icon icon={AppIcons.info} onPress={handleLocationInfo} disabled={isSubmitting} />}
            autoCapitalize={'words'}
            suggestions={publicLocationSuggestions}
          />
          <View style={[commonStyles.paddingBottom]}>
            <FezTypePickerField name={'fezType'} label={'Type'} value={values.fezType} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <DatePickerField name={'startDate'} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <TimePickerField name={'startTime'} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <DurationPickerField name={'duration'} label={'Duration'} value={values.duration} />
          </View>
          <TextField
            viewStyle={styles.inputContainer}
            name={'minCapacity'}
            label={'Minimum Attendees Needed'}
            keyboardType={'numeric'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'maxCapacity'}
            label={'Maximum Attendees Desired'}
            right={<TextInput.Icon icon={AppIcons.info} onPress={handleMaxInfo} />}
            keyboardType={'numeric'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'info'}
            label={'Event Info'}
            multiline={true}
            numberOfLines={3}
          />
          <PrimaryActionButton
            disabled={!values.title || isSubmitting || !isValid}
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
