import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {Text} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

export const PhotostreamHelpScreen = () => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    title: {
      ...commonStyles.bold,
      ...commonStyles.marginBottomSmall,
    },
    paragraph: {
      ...commonStyles.marginBottomSmall,
    },
  });

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text variant={'titleLarge'} style={styles.title}>
            Photo Stream
          </Text>
          <Text style={styles.paragraph}>
            Its a stream. Of photos. A photostream. Share what you're seeing on the ship.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
