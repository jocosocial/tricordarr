import React, {FC} from 'react';
import {MentionSuggestionsProps} from 'react-native-controlled-mentions';
import {Pressable, View, StyleSheet} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {UserBylineTag} from '../../Text/Tags/UserBylineTag.tsx';
import {useUserMatchQuery} from '../../Queries/Users/UsersQueries.ts';

export const ContentPostMentionSuggestionsView: FC<MentionSuggestionsProps> = ({keyword, onSuggestionPress}) => {
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
            onPress={() => onSuggestionPress({id: one.userID, name: one.username})}
            style={styles.pressable}>
            <UserBylineTag user={one} />
          </Pressable>
        ))}
    </View>
  );
};
