import {StackActions} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {FezType} from '#src/Enums/FezType';
import {navigationRef} from '#src/Libraries/NavigationRef';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {OobeStackComponents} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {RootStackComponents} from '#src/Navigation/Stacks/Root/RootStackComponents';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';
import {BottomTabComponents} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';
import {FezData} from '#src/Structs/ControllerStructs';

/**
 * Pop to an existing screen in the current stack if it matches by name and ID,
 * otherwise push it. Same-stack only; does not jump tabs.
 *
 * Do not use React Navigation 7 `popTo()` for this: when the target is missing,
 * POP_TO replaces the current screen instead of pushing on top of it.
 *
 * @param navigation Stack navigation from useCommonStack() / useNavigation() in a screen.
 * @param name Target screen name.
 * @param params Params to push if the screen is not already below the current route.
 * @param idKey Param key used to distinguish instances of the same screen (e.g. fezID, eventID).
 */
export const popToOrPush = <Name extends keyof CommonStackParamList>(
  navigation: StackNavigationProp<CommonStackParamList>,
  name: Name,
  params: CommonStackParamList[Name],
  idKey: keyof NonNullable<CommonStackParamList[Name]> & string,
): void => {
  const targetId = (params as Record<string, unknown> | undefined)?.[idKey];
  const state = navigation.getState();
  for (let i = state.index - 1; i >= 0; i--) {
    const route = state.routes[i];
    if (route.name !== name) {
      continue;
    }
    const routeId = (route.params as Record<string, unknown> | undefined)?.[idKey];
    if (routeId === targetId) {
      navigation.pop(state.index - i);
      return;
    }
  }
  navigation.dispatch(StackActions.push(name, params as object));
};

/**
 * Open the LFG or private event screen associated with a fez chat.
 * Pops back to that screen if it is already in the current stack; otherwise pushes it.
 *
 * @param navigation Stack navigation from a screen (not a Paper portal).
 * @param fez The fez whose parent screen should be shown.
 */
export const openFezParentScreen = (navigation: StackNavigationProp<CommonStackParamList>, fez: FezData): void => {
  if (FezType.isLFGType(fez.fezType)) {
    popToOrPush(navigation, CommonStackComponents.lfgScreen, {fezID: fez.fezID}, 'fezID');
  } else if (fez.fezType === FezType.privateEvent) {
    popToOrPush(navigation, CommonStackComponents.personalEventScreen, {eventID: fez.fezID}, 'eventID');
  }
};

/**
 * Open the chat screen for an LFG or private event.
 * Pops back to that chat if it is already in the current stack; otherwise pushes it.
 *
 * @param navigation Stack navigation from a screen (not a Paper portal).
 * @param fezID The fez to open chat for.
 * @param fezType Used to choose LFG vs private event chat.
 * @param initialReadCount Optional hint for the chat's initial unread marker.
 */
export const openFezChatScreen = (
  navigation: StackNavigationProp<CommonStackParamList>,
  fezID: string,
  fezType: FezType,
  initialReadCount?: number,
): void => {
  if (fezType === FezType.privateEvent) {
    popToOrPush(navigation, CommonStackComponents.privateEventChatScreen, {fezID, initialReadCount}, 'fezID');
  } else if (FezType.isLFGType(fezType)) {
    popToOrPush(navigation, CommonStackComponents.lfgChatScreen, {fezID, initialReadCount}, 'fezID');
  }
};

/**
 * Open the login form from code outside any stack (a snackbar action, an account switcher). Pass the
 * server and username to pre-fill them, e.g. to sign a revoked account back in.
 */
export const navigateToLogin = (params?: {serverUrl?: string; username?: string}): void => {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.navigate(RootStackComponents.rootContentScreen, {
    screen: BottomTabComponents.homeTab,
    params: {
      screen: MainStackComponents.mainSettingsScreen,
      params: {
        screen: SettingsStackScreenComponents.login,
        params,
      },
    },
  });
};

/**
 * Open the setup flow to add an account (pick a server, conduct, then log in / create / proceed),
 * starting on `serverUrl` if given. It is a root-level stack, so this works from anywhere: the
 * switcher sheet and the Accounts screen.
 */
export const navigateToAddAccount = (serverUrl?: string): void => {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    StackActions.push(RootStackComponents.oobeNavigator, {
      screen: OobeStackComponents.oobeServerScreen,
      params: {mode: 'addAccount', serverUrl},
    }),
  );
};

/**
 * Open the setup flow to leave pre-registration for the ship, starting at its "Welcome Aboard"
 * screen. Pushed on top of the app, so backing out returns to where the user was.
 */
export const navigateToBoarding = (): void => {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    StackActions.push(RootStackComponents.oobeNavigator, {
      screen: OobeStackComponents.oobePreregistrationScreen,
    }),
  );
};
