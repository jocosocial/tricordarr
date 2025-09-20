import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {ModalCard} from '#src/Components/Cards/ModalCard';

export const ReportModalSuccessView = () => {
  const {commonStyles} = useStyles();

  return (
    <View>
      <ModalCard
        title={'Report'}
        content={<Text style={[commonStyles.marginBottomSmall]}>Report submitted successfully!</Text>}
      />
    </View>
  );
};
