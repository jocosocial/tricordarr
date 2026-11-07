import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {ModerateButtonHelpTopicView} from '#src/Components/Views/Help/Common/ModerateButtonHelpTopicView';
import {ReloadButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReloadButtonHelpTopicView';
import {ReportButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReportButtonHelpTopicView';
import {ShareButtonHelpTopicView} from '#src/Components/Views/Help/Common/ShareButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

/**
 * Help for Quartermastarr: the board, search, anonymity, swipe actions, the FAB, and menu actions.
 */
export const QuartermasterHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Quartermastarr is a have/need board for the ship. Post something you have to offer, or something you are
            looking for, and other people can find it and get in touch.
          </HelpTopicView>
          <HelpTopicView title={'Have'} icon={AppIcons.quartermasterHave}>
            The Have button at the top shows things people are offering.
          </HelpTopicView>
          <HelpTopicView title={'Need'} icon={AppIcons.quartermasterNeed}>
            The Need button at the top shows things people are looking for.
          </HelpTopicView>
          <HelpTopicView title={'Search'} icon={AppIcons.search}>
            Search looks through item names, descriptions, and locations within Have or Need. Enter at least three
            characters and press search. Use the clear button to see everything again.
          </HelpTopicView>
          <HelpTopicView title={'Location and Anonymity'}>
            A location is optional so people know where to find you or the item. If you post anonymously your name is
            hidden from other users, and a location is required so people have another way to find you. Moderators can
            still see who posted.
          </HelpTopicView>
          <HelpTopicView title={'Clean Up'}>
            Items do not expire. Please delete your items once you no longer have or need them.
          </HelpTopicView>
          <HelpTopicView title={'Moderated Items'}>
            Items that a moderator has quarantined show a notice instead of their contents, and you cannot open them.
            Locked items can still be viewed, but their owner can no longer change or delete them.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Swipe Actions'}>
          <HelpTopicView title={'Your Items'} icon={AppIcons.delete}>
            Swipe one of your own items to delete it. You will be asked to confirm.
          </HelpTopicView>
          <HelpTopicView title={"Other People's Items"} icon={AppIcons.seamail}>
            Swipe an item to start a Seamail with the person who posted it. This is not available for anonymous items.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Floating Action Button'}>
          <HelpFABView icon={AppIcons.new} label={'New Item'} />
          <HelpTopicView>
            Press the "New Item" button in the lower right to post an item in the category you are viewing. Use "Save &
            Add Another" to post several items that share a category, location, and anonymity setting; only the name,
            description, and photo are cleared. You must be a verified user to post.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Filter'} icon={AppIcons.filter}>
            "My Items" limits the list to things you posted, within Have or Need. A filter is active if the menu icon is
            blue. Long press the filter menu button to clear any active filters.
          </HelpTopicView>
          <ReloadButtonHelpTopicView />
          <HelpTopicView title={'Send Seamail'} icon={AppIcons.seamail}>
            On an item, starts a Seamail with the person who posted it, with the item name as the subject. This is not
            available for your own items or anonymous items.
          </HelpTopicView>
          <HelpTopicView title={'Edit'} icon={AppIcons.edit}>
            In the item menu, edits your own item unless a moderator has locked or quarantined it.
          </HelpTopicView>
          <HelpTopicView title={'Delete'} icon={AppIcons.delete}>
            In the item menu, removes your own item unless a moderator has locked or quarantined it.
          </HelpTopicView>
          <ShareButtonHelpTopicView />
          <ReportButtonHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Privileged Actions'}>
          <ModerateButtonHelpTopicView />
          <HelpTopicView title={'Edit and Delete'}>
            Moderators can edit and delete any item, including quarantined and locked ones, from the moderation screen.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
