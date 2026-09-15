import React, {FC, useMemo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {SuggestionsProvidedProps} from 'react-native-controlled-mentions';
import {ActivityIndicator} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useUserMatchQuery} from '#src/Queries/Users/UsersQueries';

/**
 * Suggestion list shown while typing @mentions in a content post.
 * Each match displays the user's avatar beside their byline.
 */
export const ContentPostMentionSuggestionsView: FC<SuggestionsProvidedProps> = ({keyword, onSelect}) => {
  const {data, isFetching} = useUserMatchQuery({searchQuery: keyword || ''});
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pressable: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          padding: 12,
        },
        byline: {
          ...commonStyles.marginLeftSmall,
          ...commonStyles.flex,
        },
        loading: {
          ...commonStyles.marginVertical,
        },
      }),
    [commonStyles],
  );

  if (keyword == null) {
    return null;
  }

  if (isFetching) {
    return (
      <View style={styles.loading}>
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
            <AvatarImage userHeader={one} small />
            <View style={styles.byline}>
              <UserBylineTag user={one} />
            </View>
          </Pressable>
        ))}
    </View>
  );
};
