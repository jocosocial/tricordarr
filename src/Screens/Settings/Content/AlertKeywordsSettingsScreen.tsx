import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React, {useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Text} from 'react-native-paper';

import {KeywordChip} from '#src/Components/Chips/KeywordChip';
import {KeywordForm} from '#src/Components/Forms/KeywordForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useUserKeywordMutation} from '#src/Queries/User/UserMutations';
import {useUserKeywordQuery} from '#src/Queries/User/UserQueries';
import {KeywordFormValues} from '#src/Types/FormValues';

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
            queryClient.invalidateQueries({queryKey: ['/user/alertwords']}),
            queryClient.invalidateQueries({queryKey: ['/notification/global']}),
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
          await queryClient.invalidateQueries({queryKey: ['/user/alertwords']});
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
