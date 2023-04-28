import React from 'react';
import {View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import {useModal} from '../../Context/Contexts/ModalContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {FezPostData, ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';

interface ReportModalViewProps {
  content: ProfilePublicData | FezPostData;
}

export const ReportModalView = ({content}: ReportModalViewProps) => {
  const {setModalVisible} = useModal();
  const {commonStyles} = useStyles();

  const styles = {
    card: [commonStyles.secondaryContainer],
  };

  return (
    <View>
      <Card style={styles.card}>
        <Card.Title titleVariant={'titleLarge'} title={'Report'} />
        <Card.Content>
          <Text style={{marginBottom: 10}}>
            Use this form to report content or users to the Twitarr Moderation Team. We'll review it within 24 hours,
            and if deemed inappropriate the content will be removed and we may take actions against its author.
          </Text>
          <Text style={{marginBottom: 10}}>
            The content you reported is already attached. You can add additional information below.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => console.log('SUBMIT')}>Send Report</Button>
          <Button onPress={() => setModalVisible(false)}>Cancel</Button>
        </Card.Actions>
      </Card>
    </View>
  );
};
