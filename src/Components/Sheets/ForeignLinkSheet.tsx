import React from 'react';
import URLParse from 'url-parse';

import {AppBottomSheet} from '#src/Components/Sheets/AppBottomSheet';
import {AppBottomSheetButton} from '#src/Components/Sheets/AppBottomSheetButton';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useAccountSwitcher} from '#src/Hooks/useAccountSwitcher';
import {
  accountLabel,
  AccountListEntry,
  accountStatusLabel,
  anonymousSessionLabel,
  isServerPreRegistration,
} from '#src/Libraries/Account';
import {openInBrowser} from '#src/Libraries/Browser';
import {createLogger} from '#src/Libraries/Logger';
import {navigateToAddAccount} from '#src/Libraries/Navigation';
import {stashServerLink} from '#src/Libraries/Notifications/AccountLink';
import {appUrl, extractPathFromWebUrl} from '#src/Libraries/UrlParser';

const logger = createLogger('ForeignLinkSheet.tsx');

interface ForeignLinkSheetProps {
  /** The universal link, as the OS delivered it. */
  url: string;
  /** Accounts and anonymous sessions on this device that belong to the link's server. */
  candidates: AccountListEntry[];
  isPresented: boolean;
  onDismiss: () => void;
}

/**
 * Asks where a link for another server should open: one of the device's accounts or anonymous
 * sessions on that server, a new account, or the browser. The link is held by server, so it opens
 * in whichever session the user lands on there. Buttons are disabled while a switch is in flight.
 */
export const ForeignLinkSheet = ({url, candidates, isPresented, onDismiss}: ForeignLinkSheetProps) => {
  const {switchToSession, serverProfiles} = useSession();
  const {switchAccount, isSwitching} = useAccountSwitcher();
  const {theme} = useAppTheme();
  const linkHost = new URLParse(url).hostname;
  const linkServerUrl = `https://${linkHost}`;

  // Held by server so the link survives a login as a different user, and an anonymous session or a
  // new account, none of which have an account ID to wait for.
  const holdLink = (serverUrl: string) => stashServerLink(serverUrl, appUrl(extractPathFromWebUrl(url)));

  // No explicit dismiss: a switch remounts the scope (sheet included), and a login redirect is a
  // navigation, which closes the sheet.
  const onSelect = async (entry: AccountListEntry) => {
    if (entry.kind === 'anonymous') {
      holdLink(entry.session.serverUrl);
      await switchToSession(entry.session.sessionID);
    } else {
      holdLink(entry.account.serverUrl);
      await switchAccount(entry.account);
    }
  };

  const onAddAccount = () => {
    holdLink(linkServerUrl);
    navigateToAddAccount(linkServerUrl);
    onDismiss();
  };

  const onBrowser = () => {
    onDismiss();
    openInBrowser(url).catch(err => logger.error('Failed to open URL in browser:', err));
  };

  return (
    <AppBottomSheet
      title={`Open link on ${linkHost}`}
      isPresented={isPresented}
      onDismiss={onDismiss}
      buttonCount={candidates.length + 2}>
      {candidates.map(entry => {
        const serverUrl = entry.kind === 'account' ? entry.account.serverUrl : entry.session.serverUrl;
        const status = entry.kind === 'account' ? accountStatusLabel(entry.account) : undefined;
        const label = entry.kind === 'account' ? accountLabel(entry.account) : anonymousSessionLabel(entry.session);
        return (
          <AppBottomSheetButton
            key={entry.key}
            buttonText={status ? `${label} (${status})` : label}
            icon={
              isServerPreRegistration(serverProfiles.find(p => p.serverUrl === serverUrl))
                ? AppIcons.preregistration
                : undefined
            }
            onPress={() => onSelect(entry)}
            testID={`foreignLinkAccount-${entry.key}`}
            disabled={isSwitching}
            buttonColor={theme.colors.inverseSurface}
            textColor={theme.colors.inverseOnSurface}
          />
        );
      })}
      <AppBottomSheetButton
        buttonText={'Add Account'}
        icon={AppIcons.new}
        onPress={onAddAccount}
        testID={'foreignLinkAddAccount-button'}
        disabled={isSwitching}
      />
      <AppBottomSheetButton
        buttonText={'Open in Browser'}
        icon={AppIcons.webview}
        onPress={onBrowser}
        testID={'foreignLinkBrowser-button'}
        disabled={isSwitching}
      />
    </AppBottomSheet>
  );
};
