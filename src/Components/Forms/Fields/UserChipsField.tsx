import {FastField, useField} from 'formik';
import React from 'react';
import {View} from 'react-native';

import {UserChip} from '#src/Components/Chips/UserChip';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserChipsFieldProps {
  name: string;
  allowRemoveSelf?: boolean;
  label?: string;
  searchFavorersOnly?: boolean;
}
export const UserChipsField = ({
  name,
  label,
  allowRemoveSelf = false,
  searchFavorersOnly = false,
}: UserChipsFieldProps) => {
  const {commonStyles} = useStyles();
  const {data: profilePublicData} = useUserProfileQuery();
  const [field, _, helpers] = useField<UserHeader[]>(name);

  const styles = {
    parentContainer: [],
    searchBarContainer: [commonStyles.marginBottomSmall],
  };

  const addUserHeader = async (newUserHeader: UserHeader) => {
    // https://stackoverflow.com/questions/1988349/array-push-if-does-not-exist
    const existingIndex = field.value.findIndex(header => header.userID === newUserHeader.userID);
    if (existingIndex === -1) {
      await helpers.setValue(field.value.concat([newUserHeader]));
    }
  };

  const removeUserHeader = async (user: UserHeader) => {
    if (!allowRemoveSelf && user.userID === profilePublicData?.header.userID) {
      return;
    }
    await helpers.setValue(field.value.filter(header => header.userID !== user.userID));
  };

  // https://codereacter.medium.com/reducing-the-number-of-renders-when-using-formik-9790bf111ab9
  return (
    <FastField name={name}>
      {() => (
        <View style={styles.parentContainer}>
          <View style={styles.searchBarContainer}>
            <UserMatchSearchBar
              label={label}
              excludeHeaders={field.value}
              onPress={addUserHeader}
              favorers={searchFavorersOnly}
              // Explicitly clear the search bar when a user is added
              // https://github.com/jocosocial/tricordarr/issues/256
              clearOnPress={true}
            />
          </View>
          <View style={commonStyles.chipContainer}>
            {field.value.flatMap((user: UserHeader) => (
              <UserChip
                key={user.userID}
                userHeader={user}
                onClose={() => removeUserHeader(user)}
                disabled={user.userID === profilePublicData?.header.userID}
              />
            ))}
          </View>
        </View>
      )}
    </FastField>
  );
};
