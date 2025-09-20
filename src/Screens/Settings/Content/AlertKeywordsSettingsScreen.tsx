import React, {useEffect, useState} from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useUserKeywordQuery} from '#src/Queries/User/UserQueries';
import {RefreshControl, View} from 'react-native';
import {KeywordChip} from '#src/Components/Chips/KeywordChip';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {Text} from 'react-native-paper';
import {KeywordForm} from '#src/Components/Forms/KeywordForm';
import {KeywordFormValues} from '#src/Types/FormValues';
import {FormikHelpers} from 'formik';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {useQueryClient} from '@tanstack/react-query';
import {useUserKeywordMutation} from '#src/Queries/User/UserMutations';

export const AlertKeywordsSettingsScreen = () => {
  const {isLoggedIn} = useAuth();
  const [refreshing, setIsRefreshing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const {commonStyles} = useStyles();
  const queryClient = useQueryClient();

  const {data, refetch} = useUserKeywordQuery({
    keywordType: 'alertwords',
  });
  const keywordMutation = useUserKeywordMutation();

  const handleChipPress = (keyword: string) => {
    keywordMutation.mutate(
      {
        keywordType: 'alertwords',
        keyword: keyword,
        action: 'remove',
      },
      {
        onSuccess: async () => {
          setKeywords(keywords.filter(kw => kw !== keyword));
          await Promise.all([
            queryClient.invalidateQueries(['/user/alertwords']),
            queryClient.invalidateQueries(['/notification/global']),
          ]);
        },
      },
    );
  };

  const handleNewWord = (values: KeywordFormValues, helpers: FormikHelpers<KeywordFormValues>) => {
    keywordMutation.mutate(
      {
        keywordType: 'alertwords',
        keyword: values.keyword,
        action: 'add',
      },
      {
        onSuccess: async () => {
          setKeywords([keywords, values.keyword].flat());
          helpers.resetForm();
          await queryClient.invalidateQueries(['/user/alertwords']);
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (data) {
      setKeywords(data.keywords);
    }
  }, [data]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <Text>Generate an alert/notification whenever new content is made containing these keywords.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Current Words:</Text>
          <View style={[commonStyles.flexRow, commonStyles.flexWrap, commonStyles.marginTopSmall]}>
            {keywords.length === 0 && <Text style={[commonStyles.italics]}>You have not set any words.</Text>}
            {keywords.map(keyword => (
              <KeywordChip key={keyword} keyword={keyword} onClose={() => handleChipPress(keyword)} />
            ))}
          </View>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Add New Word:</Text>
          <KeywordForm onSave={handleNewWord} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
