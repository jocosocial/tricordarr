import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ReportData} from '../../libraries/Structs/ControllerStructs';
import {useAppTheme} from '../../styles/Theme';
import {Button, Card, Text} from 'react-native-paper';
import {TextField} from './Fields/TextField';
import {SaveButton} from '../Buttons/SaveButton';
import {useModal} from '../Context/Contexts/ModalContext';

interface ReportContentFormProps {
  onSubmit: (values: ReportData, formikBag: FormikHelpers<ReportData>) => void;
}

const initialValues: ReportData = {
  message: '',
};

// https://formik.org/docs/guides/react-native
export const ReportContentForm = ({onSubmit}: ReportContentFormProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const {setModalVisible} = useModal();

  const styles = {
    card: [commonStyles.secondaryContainer],
    text: [commonStyles.marginBottomSmall],
  };

  return (
    <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={onSubmit}>
      {({handleSubmit, isSubmitting}) => (
        <View>
          <Card style={styles.card}>
            <Card.Title titleVariant={'titleLarge'} title={'Report'} />
            <Card.Content>
              <Text style={styles.text}>
                Use this form to report content or users to the Twitarr Moderation Team. We'll review it within 24
                hours, and if deemed inappropriate the content will be removed and we may take actions against its
                author.
              </Text>
              <Text style={styles.text}>
                The content you are reporting is already attached. You can add additional information below.
              </Text>
              <TextField name={'message'} multiline={true} numberOfLines={3} />
            </Card.Content>
            <Card.Actions>
              <SaveButton
                buttonColor={theme.colors.twitarrNegativeButton}
                buttonText={'Send Report'}
                onPress={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              />
              <Button mode={'outlined'} onPress={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Card.Actions>
          </Card>
        </View>
      )}
    </Formik>
  );
};
