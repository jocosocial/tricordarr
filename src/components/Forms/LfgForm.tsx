import React from 'react';
import {Keyboard, View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {TextInput} from 'react-native-paper';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useStyles} from '../Context/Contexts/StyleContext';
import * as Yup from 'yup';
import {TextField} from './Fields/TextField';
import {
  DateValidation,
  FezTypeValidation,
  InfoStringValidation,
  NumberValidation,
} from '../../libraries/ValidationSchema';
import {FezType} from '../../libraries/Enums/FezType';
import {FezFormValues} from '../../libraries/Types/FormValues';
import {useModal} from '../Context/Contexts/ModalContext';
import {HelpModalView} from '../Views/Modals/HelpModalView';

interface LfgFormProps {
  onSubmit: (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
  location: InfoStringValidation,
  // info: InfoStringValidation,
  // minCapacity: NumberValidation,
  // maxCapacity: NumberValidation,
  // fezType: FezTypeValidation,
  // startTime: DateValidation,
});

const initialValues: FezFormValues = {
  title: '',
  location: '',
  fezType: FezType.activity,
  startTime: '',
  duration: 30,
  minCapacity: 2,
  maxCapacity: 2,
  info: '',
};

const locationHelpContent = [
  "1. LFGs are not a reservation system. You can't claim a room or even a table by scheduling an LFG there.",
  "2. Don't set up an LFG in a room used for Official or Shadow Events.",
  "3. Don't try to get around Item 2 by scheduling your LFG in an Event room at a time when the Official Schedule doesn't list anything happening there. Event rooms are often used for official things even when not running a listed event.",
  '4. Sometimes places fill up; have backup plans. If you schedule a "Drink Like a Pirate" LFG at a bar onboard, and that bar\'s full at the appointed time, you can message the LFG members to relocate.',
];

export const LfgForm = ({onSubmit}: LfgFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };
  const {setModalVisible, setModalContent} = useModal();

  const handleLocationInfo = () => {
    Keyboard.dismiss();
    setModalContent(<HelpModalView title={'About LFG Locations'} text={locationHelpContent} />);
    setModalVisible(true);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid}) => (
        <View>
          <TextField
            viewStyle={styles.inputContainer}
            name={'title'}
            label={'Title'}
            left={<TextInput.Icon icon={AppIcons.events} />}
            autoCapitalize={'words'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'location'}
            label={'Location'}
            left={<TextInput.Icon icon={AppIcons.map} />}
            right={<TextInput.Icon icon={AppIcons.info} onPress={handleLocationInfo} />}
            autoCapitalize={'words'}
          />
          <PrimaryActionButton
            disabled={!values.title || isSubmitting || !isValid}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Create'}
          />
        </View>
      )}
    </Formik>
  );
};
