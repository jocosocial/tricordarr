import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import tricordarr from '#assets/PlayStore/tricordarr.jpg';

export const OobeTitleScreen = () => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    text: [commonStyles.textCenter, {color: 'white'}],
    image: commonStyles.roundedBorderLarge,
  });

  return (
    <AppView disablePreRegistrationWarning={true}>
      <View style={{backgroundColor: 'black', flex: 1}}>
        <ScrollingContentView isStack={true}>
          <PaddedContentView>
            <Text style={styles.text} variant={'displayLarge'}>
              {'\n'}Tricordarr Tips
            </Text>
          </PaddedContentView>
          <PaddedContentView>
            <Text style={styles.text}>{'\n'}</Text>
          </PaddedContentView>
          <PaddedContentView>
            <AppImage
              mode={'scaledimage'}
              image={AppImageMetaData.fromAsset(tricordarr, 'tricordarr.jpg')}
              style={styles.image}
              disableTouch={true}
            />
          </PaddedContentView>
          <PaddedContentView>
            <Text style={styles.text} variant={'displaySmall'}>
              {'\n'}Pre-Registration
            </Text>
          </PaddedContentView>
        </ScrollingContentView>
      </View>
    </AppView>
  );
};
