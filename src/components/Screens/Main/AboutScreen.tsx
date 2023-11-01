import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const AboutScreen = () => {
  const {commonStyles} = useStyles();
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            Credits:
          </Text>
          <Text>
            Grant Cohoe (@grant) built this app with contributions from Dustin Hendrickson (@hendu), Chall Fry (@cfry),
            and support from the rest of the Twitarr team and viewers like you. Thank you!
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
