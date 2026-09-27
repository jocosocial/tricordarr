import React from 'react';
import {Card, Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface OobeLocationCardProps {
  title: string;
  description: string;
  image: AppImageMetaData;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * Tappable choice card used on OobeLocationScreen ("On Land" / "On Ship"). Tapping the
 * card pre-populates a server URL for the session; it does not set preRegistrationMode,
 * which is instead derived later from the server's own ClientSettingsData.
 */
export const OobeLocationCard = ({title, description, image, onPress, disabled, testID}: OobeLocationCardProps) => {
  const {commonStyles} = useStyles();
  return (
    <Card onPress={onPress} disabled={disabled} testID={testID}>
      <Card.Title title={title} titleVariant={'bodyLarge'} titleStyle={[commonStyles.bold]} />
      <Card.Content style={commonStyles.marginBottom}>
        <Text>{description}</Text>
      </Card.Content>
      <AppImage image={image} mode={'cardcover'} disableTouch={true} />
    </Card>
  );
};
