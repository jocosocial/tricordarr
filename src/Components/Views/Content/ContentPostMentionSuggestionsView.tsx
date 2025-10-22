import React, {FC} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {SuggestionsProvidedProps} from 'react-native-controlled-mentions';
import {ActivityIndicator} from 'react-native-paper';

import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useUserMatchQuery} from '#src/Queries/Users/UsersQueries';

export const ContentPostMentionSuggestionsView: FC<SuggestionsProvidedProps> = ({keyword, onSelect}) => {
  const {data, isFetching} = useUserMatchQuery({searchQuery: keyword || ''});
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    pressable: {
      padding: 12,
    },
  });

  if (keyword == null) {
    return null;
  }

  if (isFetching) {
    return (
      <View style={commonStyles.marginVertical}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View>
      {data
        ?.filter(one => one.username.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()))
        .map(one => (
          <Pressable
            key={one.userID}
            onPress={() => onSelect({id: one.userID, name: one.username})}
            style={styles.pressable}>
            <UserBylineTag user={one} />
          </Pressable>
        ))}
    </View>
  );
};
