import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React from 'react';
import {ListSection} from '../../Lists/ListSection.tsx';
import {ListSubheader} from '../../Lists/ListSubheader.tsx';
import {HelpSectionView} from '../../Views/Help/HelpSectionView.tsx';
import {HelpParagraphText} from '../../Text/Help/HelpParagraphText.tsx';

export const LfgHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView overScroll={true} isStack={true}>
        <ListSection>
          <ListSubheader>About</ListSubheader>
          <PaddedContentView padTop={true}>
            <HelpSectionView>
              <HelpParagraphText>
                LFGs are small(ish) community organized events. Use them to play a board game, go on an excursion, eat
                at a restaurant, or do any other group activity.
              </HelpParagraphText>
            </HelpSectionView>
            <HelpSectionView>
              <HelpParagraphText>
                If you're looking for something to do and want to meet some new people: check out the LFGs, find an
                activity that sounds fun, and join up.
              </HelpParagraphText>
            </HelpSectionView>
          </PaddedContentView>
        </ListSection>
        <ListSection>
          <ListSubheader>Limitations</ListSubheader>
          <PaddedContentView padTop={true}>
            <HelpSectionView>
              <HelpParagraphText>
                LFGs are meant for small groups doing an activity together. All of the event rooms on the ship are for
                actual scheduled Events. JoCo Cruise does not provide logistical or technical support for LFGs.
              </HelpParagraphText>
            </HelpSectionView>
            <HelpSectionView>
              <HelpParagraphText>
                LFGs are not a reservation system of any sort. Luckily, LFGs have built-in chat, so you can come up with
                a backup plan with everyone and meet somewhere else/play a different game/eat at a different restaurant.
              </HelpParagraphText>
            </HelpSectionView>
            <HelpSectionView>
              <HelpParagraphText>
                People of all ages read Twitt-Arr and LFGs are a public forum like the rest of Twitt-Arr. Please use the
                usual discretion and keep the Code of Conduct in mind.
              </HelpParagraphText>
            </HelpSectionView>
          </PaddedContentView>
        </ListSection>
        <ListSection>
          <ListSubheader>Filters</ListSubheader>
          <PaddedContentView padTop={true}>
            <HelpSectionView>
              <HelpParagraphText>
                You can filter LFGs by using the filter menus at the top of the screen. A filter is active if the menu
                icon is blue and the item in the list is slightly highlighted. Long press the menu button to clear all
                active filters.
              </HelpParagraphText>
            </HelpSectionView>
          </PaddedContentView>
        </ListSection>
        <ListSection>
          <ListSubheader>Settings</ListSubheader>
          <PaddedContentView padTop={true}>
            <HelpSectionView>
              <HelpParagraphText>
                You can change the default LFG screen (Find, Joined, Owned) and filter past LFGs by default in the
                settings. Tap the menu in the upper right of any LFG screen and select Settings.
              </HelpParagraphText>
            </HelpSectionView>
          </PaddedContentView>
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
