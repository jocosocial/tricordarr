import {FormikHelpers} from 'formik';
import React, {ReactNode} from 'react';

import {ServerUrlSettingForm} from '#src/Components/Forms/Settings/ServerUrlSettingForm';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HealthcheckResult, HealthcheckResultView} from '#src/Components/Views/Settings/ServerHealthcheckResultView';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {ServerChoices} from '#src/Libraries/Network/ServerChoices';
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';
import {ServerUrlFormValues} from '#src/Types/FormValues';

interface ServerChoiceViewProps {
  serverUrl: string;
  onChange: (serverUrl: string) => void;
  health: HealthcheckResult;
  /** Guidance shown above the form. */
  header?: ReactNode;
}

/**
 * Pick a server and see its healthcheck, without switching to it. The caller holds the choice and
 * decides when (and whether) to commit to it, so a flow can preview a server before leaving the
 * session it is in.
 */
export const ServerChoiceView = ({serverUrl, onChange, health, header}: ServerChoiceViewProps) => {
  const {hasUnsavedWork} = useErrorHandler();

  const onSave = (values: ServerUrlFormValues, helpers: FormikHelpers<ServerUrlFormValues>) => {
    const normalized = normalizeServerUrl(values.serverUrl);
    onChange(normalized);
    helpers.resetForm({values: {serverChoice: ServerChoices.fromUrl(normalized), serverUrl: normalized}});
    helpers.setSubmitting(false);
  };

  return (
    <ScrollingContentView isStack={false}>
      {header}
      <PaddedContentView padTop={!header}>
        <ServerUrlSettingForm
          onSubmit={onSave}
          initialValues={{serverChoice: ServerChoices.fromUrl(serverUrl), serverUrl}}
        />
      </PaddedContentView>
      {!hasUnsavedWork && (
        <PaddedContentView>
          <HealthcheckResultView {...health} />
        </PaddedContentView>
      )}
    </ScrollingContentView>
  );
};
