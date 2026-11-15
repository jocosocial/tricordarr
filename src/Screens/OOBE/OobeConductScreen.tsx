import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {MarkdownScreenBase} from '#src/Components/Screens/MarkdownScreenBase';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useExplicitServerConduct} from '#src/Hooks/useExplicitServerConduct';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeConductScreen>;

/**
 * Code of conduct of the server being set up, read from that server rather than the active one.
 */
export const OobeConductScreen = ({navigation, route}: Props) => {
  const {mode, serverUrl} = route.params;
  const {data, refetch, isFetching} = useExplicitServerConduct(serverUrl);
  const {commonStyles} = useStyles();

  return (
    <MarkdownScreenBase
      data={data}
      refetch={refetch}
      isFetching={isFetching}
      scrollViewStyle={commonStyles.marginBottomZero}
      disablePreRegistrationWarning={true}
      footer={
        <OobeButtonsView
          leftOnPress={() => navigation.goBack()}
          rightText={'I Agree'}
          rightOnPress={() => navigation.push(OobeStackComponents.oobeAccountScreen, {mode, serverUrl})}
          rightDisabled={!data}
        />
      }
    />
  );
};
