import {FastField, useField} from 'formik';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {HelperText} from 'react-native-paper';

import {UserChip} from '#src/Components/Chips/UserChip';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserChipsFieldProps {
  name: string;
  allowRemoveSelf?: boolean;
  label?: string;
  searchFavorersOnly?: boolean;
  /** When set, show an error when the number of selected users is below this value. */
  minCount?: number;
  /** Error message when below minCount. Defaults to "Add at least one participant." when minCount is 1. */
  minCountErrorMessage?: string;
}
export const UserChipsField = ({
  name,
  label,
  allowRemoveSelf = false,
  searchFavorersOnly = false,
  minCount,
  minCountErrorMessage,
}: UserChipsFieldProps) => {
  const {commonStyles} = useStyles();
  const {currentUserID} = useSession();
  const [field, meta, helpers] = useField<UserHeader[]>(name);

  const styles = StyleSheet.create({
    parentContainer: {
      ...commonStyles.flex,
    },
    searchBarContainer: {
      ...commonStyles.marginBottomSmall,
    },
    chipContainer: {
      ...commonStyles.chipContainer,
    },
  });

  const addUserHeader = async (newUserHeader: UserHeader) => {
    // https://stackoverflow.com/questions/1988349/array-push-if-does-not-exist
    const existingIndex = field.value.findIndex(header => header.userID === newUserHeader.userID);
    if (existingIndex === -1) {
      await helpers.setValue(field.value.concat([newUserHeader]));
    }
  };

  const removeUserHeader = async (user: UserHeader) => {
    if (!allowRemoveSelf && user.userID === currentUserID) {
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
            {minCount != null && field.value.length < minCount ? (
              <HelperText type={'error'}>{minCountErrorMessage ?? meta.error}</HelperText>
            ) : null}
          </View>
          <View style={styles.chipContainer}>
            {field.value.flatMap((user: UserHeader) => (
              <UserChip
                key={user.userID}
                userHeader={user}
                onClose={() => removeUserHeader(user)}
                disabled={user.userID === currentUserID}
              />
            ))}
          </View>
        </View>
      )}
    </FastField>
  );
};
