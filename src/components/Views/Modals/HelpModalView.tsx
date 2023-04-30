import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ModalCard} from '../../Cards/ModalCard';

interface HelpModalViewProps {
  text: string | string[];
  title?: string;
}

export const HelpModalView = ({text, title = 'Help'}: HelpModalViewProps) => {
  const {commonStyles} = useStyles();
  return (
    <View>
      <ModalCard title={title}>
        {Array.isArray(text) &&
          text.map((t, i) => (
            <Text key={i} style={[commonStyles.marginBottomSmall]}>
              {t}
            </Text>
          ))}
        {!Array.isArray(text) && <Text style={[commonStyles.marginBottomSmall]}>{text}</Text>}
      </ModalCard>
    </View>
  );
};
