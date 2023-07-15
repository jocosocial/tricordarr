import React, {useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {useUserKeywordMutation, useUserKeywordQuery} from '../../../Queries/User/UserQueries';
import {RefreshControl, View} from 'react-native';
import {KeywordChip} from '../../../Chips/KeywordChip';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {Text} from 'react-native-paper';
import {KeywordForm} from '../../../Forms/KeywordForm';
import {KeywordFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';

export const AlertKeywordsSettingsScreen = () => {
  const [refreshing, setIsRefreshing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const {commonStyles} = useStyles();

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
        onSuccess: () => setKeywords(keywords.filter(kw => kw !== keyword)),
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
        onSuccess: () => {
          setKeywords([keywords, values.keyword].flat());
          helpers.resetForm();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const onRefresh = () => {
    refetch().then(() => setIsRefreshing(false));
  };

  useEffect(() => {
    if (data) {
      setKeywords(data.keywords);
    }
  }, [data]);

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <Text>Generate an alert/notification whenever new content is made containing these keywords.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Current Words:</Text>
          <View style={[commonStyles.flexRow, commonStyles.flexWrap, commonStyles.marginTopSmall]}>
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
