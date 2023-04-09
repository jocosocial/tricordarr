import React from 'react';
import {View} from 'react-native';
import {Formik} from 'formik';
import {TextInput} from 'react-native-paper';
import {useStyles} from '../Context/Contexts/StyleContext';
import {SubmitIconButton} from '../Buttons/IconButtons/SubmitIconButton';

interface FezPostFormProps {
  onSubmit: (values: object) => void;
  initialValues?: {
    text?: string;
  };
}

// https://formik.org/docs/guides/react-native
export const FezPostForm = ({onSubmit, initialValues = {}}: FezPostFormProps) => {
  const {commonStyles} = useStyles();

  const styles = {
    wrapperView: [commonStyles.flexRow, commonStyles.marginVerticalSmall],
    input: [
      commonStyles.flex,
      commonStyles.flexColumn,
      commonStyles.roundedBorder,
      // commonStyles.marginLeftSmall,
      commonStyles.justifyCenter,
      // commonStyles.marginRightSmall,
    ],
  };

  return (
    <Formik initialValues={initialValues} onSubmit={values => onSubmit(values)}>
      {({handleChange, handleBlur, handleSubmit, values}) => (
        <View style={styles.wrapperView}>
          <SubmitIconButton colorize={false} onPress={() => console.log('add image')} icon={'image-plus'} />
          <TextInput
            dense={true}
            mode={'flat'}
            style={styles.input}
            multiline={true}
            underlineStyle={commonStyles.displayNone}
            onChangeText={handleChange('text')}
            onBlur={handleBlur('text')}
            value={values.text}
          />
          <SubmitIconButton onPress={handleSubmit} />
        </View>
      )}
    </Formik>
  );
};
