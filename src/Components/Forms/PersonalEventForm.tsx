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
import {SuggestedTextField} from '#src/Components/Forms/Fields/SuggestedTextField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {TimePickerField} from '#src/Components/Forms/Fields/TimePickerField';
import {UserChipsField} from '#src/Components/Forms/Fields/UserChipsField';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {getUserSuggestedLocations} from '#src/Libraries/Ship';
import {DateValidation, InfoStringValidation} from '#src/Libraries/ValidationSchema';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezFormValues} from '#src/Types/FormValues';

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

const LocationHelpModalView = () => {
  const {commonStyles} = useStyles();
  return (
    <ModalCard title={'About Personal Event Locations'}>
      <Text variant={'titleMedium'}>Guidelines</Text>
      <Text>
        Personal Events are not a reservation system. You can't claim a room or even a table by scheduling an event
        there.
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
    setModalContent(<LocationHelpModalView />);
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
