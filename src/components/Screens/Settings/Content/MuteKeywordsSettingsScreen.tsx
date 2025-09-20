import React, {useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {useUserKeywordQuery} from '../../../Queries/User/UserQueries.ts';
import {RefreshControl, View} from 'react-native';
import {KeywordChip} from '../../../Chips/KeywordChip.tsx';
import {useStyles} from '../../../Context/Contexts/StyleContext.ts';
import {Text} from 'react-native-paper';
import {KeywordForm} from '../../../Forms/KeywordForm.tsx';
import {KeywordFormValues} from '../../../../Libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {NotLoggedInView} from '../../../Views/Static/NotLoggedInView.tsx';
import {useAuth} from '../../../Context/Contexts/AuthContext.ts';
import {useUserKeywordMutation} from '../../../Queries/User/UserMutations.ts';

export const MuteKeywordsSettingsScreen = () => {
  const {isLoggedIn} = useAuth();
  const [refreshing, setIsRefreshing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const {commonStyles} = useStyles();

  const {data, refetch} = useUserKeywordQuery({
    keywordType: 'mutewords',
  });
  const keywordMutation = useUserKeywordMutation();

  const handleChipPress = (keyword: string) => {
    keywordMutation.mutate(
      {
        keywordType: 'mutewords',
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
        keywordType: 'mutewords',
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

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <Text>Hide any content that contains these keywords.</Text>
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
