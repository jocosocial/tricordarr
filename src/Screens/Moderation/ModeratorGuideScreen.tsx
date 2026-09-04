import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {FlatList, Linking, StyleSheet} from 'react-native';
import {Divider, Text, TouchableRipple} from 'react-native-paper';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useClipboard} from '#src/Hooks/useClipboard';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {appUrl} from '#src/Libraries/UrlParser';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatorGuideScreen>;

const cannedResponses = [
  'Could you please clarify your intention?',
  'Please take this conversation to Seamail. Thank you.',
  'The Moderation Team appreciates that members continue to keep this discussion within the guidelines of the Code of Conduct.',
  'Please let this serve as a warning for content in violation of the Code of Conduct. Please contact the Moderation Team @moderator.',
  'This entry has been reported as a possible violation of the Code of Conduct. Please contact the Moderation Team @moderator.',
  'This entry has been reported as a violation of the Code of Conduct and has been temporarily locked until further notice. Please contact the Moderation Team @moderator.',
  'This entry has been investigated as a violation of the Code of Conduct and has been permanently locked. Thank you for your understanding.',
];

interface CannedResponsesListProps {
  responses: string[];
}

/**
 * Bold divider between canned response rows.
 */
const CannedResponseSeparator = () => <Divider bold={true} />;

/**
 * Copyable canned reply row. Long-press copies the full text.
 */
const CannedResponseItem = ({text}: {text: string}) => {
  const {commonStyles} = useStyles();
  const {setString} = useClipboard();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingVerticalSmall,
        },
      }),
    [commonStyles],
  );

  return (
    <TouchableRipple onLongPress={() => setString(text)}>
      <Text style={styles.item}>{text}</Text>
    </TouchableRipple>
  );
};

/**
 * Renders one canned response that can be copied with a long-press.
 */
const renderCannedResponse = ({item}: {item: string}) => <CannedResponseItem text={item} />;

/**
 * Nested list of copyable canned moderator replies. Does not scroll on its own
 * so the parent ScrollingContentView remains the only scroller.
 */
const CannedResponsesList = ({responses}: CannedResponsesListProps) => {
  return (
    <FlatList
      data={responses}
      keyExtractor={item => item}
      scrollEnabled={false}
      renderItem={renderCannedResponse}
      ListHeaderComponent={CannedResponseSeparator}
      ItemSeparatorComponent={CannedResponseSeparator}
    />
  );
};

const ModeratorGuideScreenInner = () => {
  useModerationHelpHeader();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Twit-arr Moderator Guidelines'} />
        <HelpTopicView>
          Welcome. This guide covers the tools you will use and when to use them. Moderators work to help the community
          thrive in a positive manner.
        </HelpTopicView>

        <HelpChapterTitleView title={'Twit-arr Concepts'} />
        <HelpTopicView title={'Users'}>
          Users provide a registration code when creating an account. They may create multiple accounts, all tied to
          that code. You will create a normal account with the reg code from THO, then someone with THO access elevates
          you. You can use a sub-account just for moderator duties.
        </HelpTopicView>
        <HelpTopicView title={'User Access Levels'}>
          Unverified: account created, no reg code, limited access. Banned: cannot log in. Quarantined: can read, but
          not post. Verified: most users. Client: bulk-access APIs. Moderator: you. TwitarrTeam: developers and IT. THO:
          Home Office, can ban users. Admin: server admin. As a mod you can set a verified user to quarantined,
          temporarily or permanently. That affects all accounts tied to their registration code.
        </HelpTopicView>
        <HelpTopicView title={'Content Types'}>
          Twarrts, forums (the title), forum posts, LFGs (title, info, location), LFG/seamail posts, user profiles
          (fields such as home location—not the user), personal events, and photostream photos. Every publicly viewable
          piece of content can be reported and moderated. Authors can edit their content; tweets, forum posts, and LFG
          posts can also be deleted by the author. All of these keep an edit trail.
        </HelpTopicView>
        <HelpTopicView title={'What you can do'}>
          Edit content any user created. Delete all content types except user profiles. Lock content so the author
          cannot edit it. Quarantine content (hides it while you confer). Move forum threads to a new category,
          including Mods Only Dumpster Fire. Only THO and Admin may ban users; if you think someone should be banned,
          open a thread in the Moderator Forum. Every use of mod powers is logged.
        </HelpTopicView>
        <HelpTopicView title={'Reports'}>
          Users report content, not other users, and they sometimes report the wrong thing (a forum instead of a post).
          Start Handling All is optional and marks reports as in-process by you. Close All when you are done so other
          mods do not think the content still needs work.
        </HelpTopicView>
        <HelpTopicView title={'Moderation actions'}>
          Edit changes text and can remove images. Delete removes the content; for a forum or LFG the posts inside
          become inaccessible—moving a forum to a moderator-only category is often better. Lock prevents the author from
          modifying it; on a forum or LFG, users cannot create new posts. Quarantine shows "Under Moderator Review" and
          removes images for non-mods. Moderator Reviewed means you looked and need no action, and it is immune to
          auto-quarantine. Mod User opens account-level actions.
        </HelpTopicView>
        <HelpTopicView title={'User moderation'}>
          Quarantine User prevents creating or modifying content on all of their accounts. Temp Quarantine does the same
          for a number of hours. Un-quarantine returns them to verified. Ban is THO-only and prevents login.
        </HelpTopicView>
        <HelpTopicView title={'How to moderate in this app'}>
          Open Moderate from the overflow menu on content, or open a report from Open Reports. From there you can edit,
          delete, set state, change a forum category, moderate the user, view the content in context, start handling
          reports, and close reports. To ask other mods about a case, copy a deep link or describe the content in the
          Moderators Only forum.
        </HelpTopicView>
        <HelpTopicView title={'Auto-Quarantine'}>
          Enough reports on the same content can auto-quarantine it, which looks like a mod quarantine. Change the state
          (even to quarantined) before closing those reports. If the content is not actually offensive, users may have
          brigaded it—set Moderator Reviewed so it cannot be auto-quarantined again. Check previous edits.
        </HelpTopicView>
        <HelpTopicView title={'Moderator Forums'}>
          Moderators Only is for discussion, questions, and elevating issues to THO. Mods Only Dumpster Fire is for
          moving problem threads where regular users cannot see them.
        </HelpTopicView>
        <HelpChapterTitleView title={'Considerations'} />
        <HelpTopicView>
          The task is to keep users from posting content contrary to the JoCo Cruise Code of Conduct. If you are not
          sure, ask in private moderator seamail. Escalate if you get no response.
        </HelpTopicView>
        <HelpTopicView title={'Issue categories'}>
          Repeats behavior after being asked to stop. Possibly mean. Actively mean. Possibly offensive (hate speech,
          racism, transphobia, ableism, homophobia, classism, religious discrimination). Actively offensive (same).
        </HelpTopicView>
        <HelpTopicView title={'Steps'}>
          Possibly mean or possibly offensive: discuss with mods, clarify intent with the user via seamail, consider
          adding to the thread, and if they do not respond consider locking and asking them to edit or delete. Actively
          mean or actively offensive: lock, contact the user, alert mods, then edit or delete as needed. A stern,
          reasonable request to redirect a thread is often enough. Lock threads that are actively going astray or that
          should take no more replies.
        </HelpTopicView>
        <HelpTopicView title={'If you delete or edit'}>
          Always mention what you did unless it is very minor, and contribute as @moderator. Deleting looks extreme;
          make sure it deserves it. If someone asks what happened, answer: what and why is enough.
        </HelpTopicView>
        <HelpTopicView title={'Onboard communications'}>
          Post as @moderator when addressing issues publicly. Seamail to @moderator alerts all mods; reply as
          @moderator. Use Moderators Only for discussion and @mention someone for a quick response. Group seamail
          notifies everyone. Raise issues behind the scenes even if only for the record.
        </HelpTopicView>

        <HelpChapterTitleView title={'Canned Responses'} />
        <HelpTopicView>Long-press a response to copy it.</HelpTopicView>
        <CannedResponsesList responses={cannedResponses} />
        <HelpChapterTitleView title={'Code of Conduct'} noMargin={true}>
          <DataFieldListItem
            title={'Code of Conduct'}
            description={'The JoCo Cruise Code of Conduct that this guide is based on.'}
            icon={AppIcons.codeofconduct}
            onPress={() => Linking.openURL(appUrl('codeOfConduct'))}
          />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};

export const ModeratorGuideScreen = (_props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModeratorGuideScreenInner />
    </ModeratorFeatureScreen>
  );
};
