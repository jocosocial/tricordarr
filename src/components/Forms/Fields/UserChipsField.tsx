import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {FastField, useField} from 'formik';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {UserChip} from '../../Chips/UserChip';
import {useUserData} from '../../Context/Contexts/UserDataContext';

interface UserChipsFieldProps {
  name: string;
  allowRemoveSelf?: boolean;
  label?: string;
  labelSubtext?: string;
  searchFavorersOnly?: boolean;
}
export const UserChipsField = ({
  name,
  label,
  labelSubtext,
  allowRemoveSelf = false,
  searchFavorersOnly = false,
}: UserChipsFieldProps) => {
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const [field, meta, helpers] = useField<UserHeader[]>(name);

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
          {label && (
            <>
              <View style={[commonStyles.paddingBottomSmall]}>
                <Text>{label}</Text>
              </View>
              {labelSubtext && (
                <View style={[commonStyles.paddingBottomSmall]}>
                  <Text variant={'labelLarge'}>{labelSubtext}</Text>
                </View>
              )}
            </>
          )}
          <View style={styles.searchBarContainer}>
            <UserSearchBar excludeHeaders={field.value} onPress={addUserHeader} favorers={searchFavorersOnly} />
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
