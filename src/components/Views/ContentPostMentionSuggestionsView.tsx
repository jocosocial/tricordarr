import {useUserMatchQuery} from '../Queries/Users/UserMatchQueries';
import React, {FC} from 'react';
import {MentionSuggestionsProps} from 'react-native-controlled-mentions';
import {Pressable, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {UserHeader} from '../../libraries/Structs/ControllerStructs';
import {useStyles} from '../Context/Contexts/StyleContext';
import {UserBylineTag} from '../Text/Tags/UserBylineTag';

export const ContentPostMentionSuggestionsView: FC<MentionSuggestionsProps> = ({keyword, onSuggestionPress}) => {
  const {data, isFetching} = useUserMatchQuery(keyword || '');
  const {commonStyles} = useStyles();

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
            style={{padding: 12}}>
            <UserBylineTag user={one} />
          </Pressable>
        ))}
    </View>
  );
};
