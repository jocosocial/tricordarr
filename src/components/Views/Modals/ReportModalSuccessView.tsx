import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useStyles} from '#src/Context/Contexts/StyleContext';

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
