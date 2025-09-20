import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ModalCard} from '#src/Components/Cards/ModalCard';

interface HelpModalViewProps {
  text: string | string[];
  title?: string;
}

/**
 * This modal view is used for form input components to give the user some additional information.
 */
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
