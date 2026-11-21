import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';

import {MarkdownScreenBase} from '#src/Components/Screens/MarkdownScreenBase';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';
import {OobeStackComponents, OobeStackParamList, useOobeStack} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {useExplicitServerConductQuery} from '#src/Queries/PublicQueries';

/**
 * Code of conduct of the server an account is about to be created on, agreed to before
 * RegisterScreen. Shared by the setup flow and the Settings stack like RegisterScreen is. Always
 * read from that server explicitly, since in the setup flow nothing has switched to it yet.
 */
export const RegisterConductScreen = () => {
  // Hooks rather than screen props, matching RegisterScreen. Both stacks name the next route the same.
  const route = useRoute<RouteProp<OobeStackParamList, 'RegisterConductScreen'>>();
  const navigation = useOobeStack();
  const {serverUrl: sessionServerUrl} = useSwiftarrQueryClient();
  const mode = route.params?.mode;
  // Opened from the register form's consent checkbox: just read it and go back.
  const viewOnly = route.params?.viewOnly;
  const serverUrl = normalizeServerUrl(route.params?.serverUrl ?? sessionServerUrl);
  const {data, refetch, isFetching} = useExplicitServerConductQuery(serverUrl);
  const {commonStyles} = useStyles();

  return (
    <MarkdownScreenBase
      data={data}
      refetch={refetch}
      isFetching={isFetching}
      scrollViewStyle={commonStyles.marginBottomZero}
      disablePreRegistrationWarning={!!mode}
      footer={
        <OobeButtonsView
          leftOnPress={mode && !viewOnly ? () => navigation.goBack() : undefined}
          rightText={viewOnly ? 'Done' : 'I Agree'}
          rightOnPress={() =>
            viewOnly ? navigation.goBack() : navigation.push(OobeStackComponents.oobeRegisterScreen, {mode, serverUrl})
          }
          rightDisabled={!data}
        />
      }
    />
  );
};
