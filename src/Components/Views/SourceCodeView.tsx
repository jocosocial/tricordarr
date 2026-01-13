import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const SourceCodeView = () => {
  const {commonStyles} = useStyles();
  return (
    <>
      <View style={commonStyles.marginBottomSmall}>
        <HyperlinkText>
          <>
            <Text>Tricordarr (this mobile app)</Text>
            <Text>https://github.com/jocosocial/tricordarr</Text>
          </>
        </HyperlinkText>
      </View>
      <View style={commonStyles.marginBottomSmall}>
        <HyperlinkText>
          <>
            <Text>Swiftarr (the server)</Text>
            <Text>https://github.com/jocosocial/swiftarr</Text>
          </>
        </HyperlinkText>
      </View>
      <View style={commonStyles.marginBottomSmall}>
        <Text>
          Keep in touch with us on the JoCo Cruise Discord in #twitarr! We're always looking for new contributors!
        </Text>
      </View>
    </>
  );
};
