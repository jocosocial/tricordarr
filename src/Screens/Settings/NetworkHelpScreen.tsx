import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const NetworkHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <HelpChapterTitleView title={'Overview'}>
          <HelpTopicView>The steps in this guide only apply when you are physically on the ship.</HelpTopicView>
          <HelpTopicView>
            The Twitarr server is on the ship with us. You do not need to be connected to the internet to use Twitarr.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView title={'Enable Airplane Mode'} icon={AppIcons.airplaneMode}>
            You must not be connected to cellular data. Leaving cellular data active once we are at sea can cause you to
            incur significant roaming charges.
          </HelpTopicView>
          <HelpTopicView title={'Ship Wi-Fi'} icon={AppIcons.wifi}>
            You must be connected to the ship's WiFi network. See platform-specific notes below.
          </HelpTopicView>
          <HelpTopicView title={'Disable VPN'} icon={AppIcons.vpn}>
            Many VPNs route all of your traffic off the ship's network which will break access to the Twitarr server.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'iOS'}>
          <HelpTopicView>
            In your device Settings app select Wi-Fi then tap the (i) next to the ship's network
          </HelpTopicView>
          <HelpTopicView title={'Private Wi-Fi Address'}>
            By default your phone will randomize its hardware MAC address when connecting to networks. We recommend
            setting this to "Off" or "Fixed".
          </HelpTopicView>
          <HelpTopicView title={'Limit IP Address Tracking'}>
            This feature secretly relays some network traffic via Apple servers, which doesn't work on ship WiFi. You
            must disable this setting.
          </HelpTopicView>
          <HelpTopicView title={'Local Network Access'}>
            If you tapped "Don't Allow" when prompted for Local Network access, the app cannot reach the ship's server.
            Open Settings, scroll down to this app, and turn on "Local Network".
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Android'}>
          <HelpTopicView>In your device Settings app select Network & Internet</HelpTopicView>
          <HelpTopicView title={'Private DNS'}>
            This feature relays some network traffic via third-party servers. Ensure Private DNS is set to "Off" or
            "Automatic".
          </HelpTopicView>
          <HelpTopicView title={'Device Privacy'}>
            If you are experiencing frequent WiFi disconnections or prompts, try setting your device a fixed MAC
            address. Select Internet then tap the gear icon next to the ship's WiFi network, then Privacy.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
