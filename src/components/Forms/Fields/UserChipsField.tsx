import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Field, useField, useFormikContext} from 'formik';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {UserChip} from '../../Chips/UserChip';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {Text} from 'react-native-paper';

interface UserChipsFieldProps {
  name: string;
  allowRemoveSelf?: boolean;
  label?: string;
}
export const UserChipsField = ({name, label, allowRemoveSelf = false}: UserChipsFieldProps) => {
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const [userHeaders, setUserHeaders] = useState<UserHeader[]>([profilePublicData.header]);
  const {setFieldValue} = useFormikContext();
  const [field, meta, helpers] = useField<string[]>(name);

  const styles = {
    parentContainer: [],
    searchBarContainer: [commonStyles.marginBottomSmall],
    chipContainer: [commonStyles.flexRow, commonStyles.flexStart, commonStyles.flexWrap, commonStyles.paddingTopSmall],
  };

  const addUserHeader = (newUserHeader: UserHeader) => {
    // https://stackoverflow.com/questions/1988349/array-push-if-does-not-exist
    const existingIndex = userHeaders.findIndex(header => header.userID === newUserHeader.userID);
    if (existingIndex === -1) {
      setUserHeaders(userHeaders.concat([newUserHeader]));
    }
  };

  const removeUserHeader = (user: UserHeader) => {
    if (!allowRemoveSelf && user.userID === profilePublicData.header.userID) {
      return;
    }
    setUserHeaders(userHeaders.filter(header => header.userID !== user.userID));
  };

  // https://stackoverflow.com/questions/62336340/cannot-update-a-component-while-rendering-a-different-component-warning
  useEffect(() => {
    if (field.value.length !== userHeaders.length) {
      setFieldValue(
        name,
        userHeaders.flatMap(header => header.userID),
      );
    }
  }, [field.value.length, name, setFieldValue, userHeaders]);

  // https://codereacter.medium.com/reducing-the-number-of-renders-when-using-formik-9790bf111ab9
  return (
    <Field name={name}>
      {() => (
        <View style={styles.parentContainer}>
          <View style={styles.searchBarContainer}>
            <UserSearchBar userHeaders={userHeaders} onPress={addUserHeader} />
          </View>
          {label && <Text>{label}</Text>}
          <View style={styles.chipContainer}>
            {userHeaders.flatMap((user: UserHeader) => (
              <UserChip
                key={user.userID}
                userHeader={user}
                onClose={() => removeUserHeader(user)}
                disabled={user.userID === profilePublicData.header.userID}
              />
            ))}
          </View>
        </View>
      )}
    </Field>
  );
};
