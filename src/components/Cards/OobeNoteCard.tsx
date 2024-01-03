import {Card, Text} from 'react-native-paper';
// @ts-ignore
import twitarrteam from '../../../assets/contributors/twitarrteam.jpg';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

export const OobeNoteCard = () => {
  const {commonStyles} = useStyles();
  return (
    <Card>
      <Card.Title title={'From the Twitarr Dev Team:'} titleVariant={'bodyLarge'} titleStyle={[commonStyles.bold]} />
      <Card.Content style={commonStyles.marginBottom}>
        <Text>
          Thanks for using our app! We hope it enhances your vacation the way it does for us. Be excellent to each other
          and have a great cruise!
        </Text>
      </Card.Content>
      <Card.Cover source={twitarrteam} />
    </Card>
  );
};
