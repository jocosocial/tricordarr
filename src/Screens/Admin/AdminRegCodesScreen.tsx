import {StackScreenProps} from '@react-navigation/stack';
import {Formik, FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import * as Yup from 'yup';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {AppIcons} from '#src/Enums/Icons';
import {isWellFormed, normalized} from '#src/Libraries/RegistrationCode';
import {RegistrationCodeValidation} from '#src/Libraries/ValidationSchema';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUserForRegCodeQuery} from '#src/Queries/Admin/RegCodeQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminRegCodesScreen>;

interface FindByCodeFormValues {
  regCode: string;
}

const validationSchema = Yup.object().shape({
  regCode: RegistrationCodeValidation,
});

/**
 * Account-manager lookup for registration codes: find by code or search by username.
 */
export const AdminRegCodesScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'accountmanager'}>
      <AdminRegCodesScreenInner {...props} />
    </AdminAccessScreen>
  );
};

/**
 * Find-by-code and search-by-user lookup. Stats are on a separate screen.
 */
const AdminRegCodesScreenInner = ({navigation}: Props) => {
  const [submittedCode, setSubmittedCode] = useState('');
  const {
    data: users,
    isFetching: searching,
    isError,
    refetch,
  } = useUserForRegCodeQuery({regCode: submittedCode}, {enabled: isWellFormed(submittedCode)});

  /**
   * Enables the lookup query. Re-submitting the same code refetches. Formik leaves
   * `isSubmitting` true on a sync submit unless we clear it, which would disable the field.
   */
  const handleFind = (values: FindByCodeFormValues, helpers: FormikHelpers<FindByCodeFormValues>) => {
    const code = normalized(values.regCode);
    if (code === submittedCode) {
      refetch();
    } else {
      setSubmittedCode(code);
    }
    helpers.setSubmitting(false);
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Stats'}
            iconName={AppIcons.statistics}
            onPress={() => navigation.push(CommonStackComponents.adminRegCodeStatsScreen)}
          />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.registrationCodeHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>Search By Code</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <Formik initialValues={{regCode: ''}} validationSchema={validationSchema} onSubmit={handleFind}>
            {({handleSubmit, values, resetForm}) => (
              <>
                <TextField
                  name={'regCode'}
                  testID={'regCodeSearch-field'}
                  label={'Registration Code'}
                  autoCapitalize={'characters'}
                  autoCorrect={false}
                  spellCheck={false}
                  left={<TextInput.Icon icon={AppIcons.registrationCode} />}
                  right={
                    values.regCode ? (
                      <TextInput.Icon
                        icon={AppIcons.close}
                        onPress={() => {
                          resetForm();
                          setSubmittedCode('');
                        }}
                      />
                    ) : undefined
                  }
                  showErrorWithoutTouch={false}
                  maxLength={7}
                />
                <PrimaryActionButton
                  testID={'regCodeSearch-button'}
                  buttonText={'Search'}
                  onPress={handleSubmit}
                  disabled={searching || !isWellFormed(values.regCode)}
                  isLoading={searching}
                />
              </>
            )}
          </Formik>
          {!searching && !isError && users && users.length === 0 && (
            <Text>Valid code with no associated account yet.</Text>
          )}
        </PaddedContentView>
        {users?.map(user => (
          <UserListItem
            key={user.userID}
            userHeader={user}
            onPress={() => navigation.push(CommonStackComponents.userRegCodeScreen, {userID: user.userID})}
          />
        ))}
        <ListSection>
          <ListSubheader>Search By User</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <UserMatchSearchBar
            testID={'regCodeUser-search'}
            label={'Username'}
            excludeSelf={false}
            onPress={user => navigation.push(CommonStackComponents.userRegCodeScreen, {userID: user.userID})}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
