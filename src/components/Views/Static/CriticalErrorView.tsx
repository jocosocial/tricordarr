import {AppView} from '../AppView.tsx';
import {View} from 'react-native';
import {AppIcon} from '../../Icons/AppIcon.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {ScrollingContentView} from '../Content/ScrollingContentView.tsx';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {HelpParagraphText} from '../../Text/Help/HelpParagraphText.tsx';
import {PaddedContentView} from '../Content/PaddedContentView.tsx';
import {BoldText} from '../../Text/BoldText.tsx';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {useAppTheme} from '../../../styles/Theme.ts';
import {Text} from 'react-native-paper';
import {useAuth} from '../../Context/Contexts/AuthContext.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {getInitialAppConfig} from '../../../libraries/AppConfig.ts';

interface CriticalErrorViewProps {
  error: Error;
  resetError: Function;
}

export const CriticalErrorView = (props: CriticalErrorViewProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const [showStack, setShowStack] = React.useState(false);
  const {signOut} = useAuth();
  const {updateAppConfig} = useConfig();

  const styles = {
    outerContainer: [commonStyles.flex, commonStyles.justifyCenter, commonStyles.alignItemsCenter],
    innerContainer: [commonStyles.justifyCenter, commonStyles.alignItemsCenter],
    contentContainer: [commonStyles.marginVerticalSmall],
  };

  const toggleShowStack = () => setShowStack(!showStack);

  const fixAll = async () => {
    await signOut();
    queryClient.clear();
    updateAppConfig(getInitialAppConfig());
    props.resetError();
  };

  const resetAppConfig = async () => {
    updateAppConfig(getInitialAppConfig());
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <View style={styles.outerContainer}>
          <PaddedContentView style={styles.innerContainer}>
            <View style={styles.contentContainer}>
              <AppIcon icon={AppIcons.error} size={150} onLongPress={toggleShowStack} />
            </View>
          </PaddedContentView>
        </View>
        <PaddedContentView>
          <HelpParagraphText>It's not you, it's me. Something has gone very wrong with this app.</HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            <BoldText>Name: </BoldText>
            {props.error.name}
          </HelpParagraphText>
          <HelpParagraphText>
            <BoldText>Message: </BoldText>
            {props.error.message}
          </HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>You can try to recover using the buttons below.</HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrPositiveButton}
            buttonText={'Fix it All'}
            onPress={fixAll}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Clear Query Cache'}
            onPress={() => queryClient.clear()}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Sign Out'}
            onPress={async () => await signOut()}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Reset Config'}
            onPress={resetAppConfig}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNeutralButton}
            buttonText={'Reload'}
            onPress={() => props.resetError()}
          />
        </PaddedContentView>
        {showStack && (
          <PaddedContentView>
            <BoldText>Stack Trace:</BoldText>
            <Text selectable={true} variant={'labelSmall'}>
              {props.error.stack}
            </Text>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
