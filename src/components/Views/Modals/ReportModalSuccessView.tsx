import React from 'react';
import {View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useModal} from '../../Context/Contexts/ModalContext';

export const ReportModalSuccessView = () => {
  const {commonStyles} = useStyles();
  const {setModalVisible} = useModal();

  const styles = {
    card: [commonStyles.secondaryContainer],
    text: [commonStyles.marginBottomSmall],
  };

  return (
    <View>
      <Card style={styles.card}>
        <Card.Title titleVariant={'titleLarge'} title={'Report'} />
        <Card.Content>
          <Text style={styles.text}>Report submitted successfully!</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode={'outlined'} onPress={() => setModalVisible(false)}>
            Close
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};
