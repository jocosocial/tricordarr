import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {
  canInteractWithQuartermasterItem,
  canMessageQuartermasterOwner,
  canModifyQuartermasterItem,
  getQuartermasterSeamailSubject,
  isOwnQuartermasterItem,
  isQuarantinedQuartermasterItem,
  isRestrictedQuartermasterItem,
  QuartermasterViewer,
} from '#src/Libraries/Quartermaster/QuartermasterAccess';
import {
  getEmptyQuartermasterFormValues,
  toQuartermasterContentData,
  toQuartermasterCreateData,
  toQuartermasterFormValues,
} from '#src/Libraries/Quartermaster/QuartermasterForm';
import {QuartermasterData} from '#src/Structs/ControllerStructs';

const owner = {userID: 'owner-1', username: 'owner'};

const makeItem = (overrides: Partial<QuartermasterData> = {}): QuartermasterData => ({
  itemID: 'item-1',
  category: QuartermasterCategory.have,
  itemName: 'Sunscreen',
  hideOwnerName: false,
  moderationStatus: ContentModerationStatus.normal,
  lastModificationTime: '2026-01-01T00:00:00Z',
  owner,
  ...overrides,
});

const user: QuartermasterViewer = {userID: 'user-2', hasModerator: false, hasVerified: true};
const ownerViewer: QuartermasterViewer = {userID: 'owner-1', hasModerator: false, hasVerified: true};
const moderator: QuartermasterViewer = {userID: 'mod-3', hasModerator: true, hasVerified: true};

describe('Quartermastarr access', () => {
  it('recognizes the owner, and never matches a missing owner', () => {
    expect(isOwnQuartermasterItem(makeItem(), ownerViewer)).toBe(true);
    expect(isOwnQuartermasterItem(makeItem(), user)).toBe(false);
    expect(isOwnQuartermasterItem(makeItem({owner: undefined}), {...user, userID: undefined})).toBe(false);
  });

  it('treats quarantined, auto-quarantined and locked items as restricted', () => {
    expect(isRestrictedQuartermasterItem(makeItem())).toBe(false);
    expect(isRestrictedQuartermasterItem(makeItem({moderationStatus: ContentModerationStatus.modReviewed}))).toBe(
      false,
    );
    for (const status of [
      ContentModerationStatus.quarantined,
      ContentModerationStatus.autoQuarantined,
      ContentModerationStatus.locked,
    ]) {
      expect(isRestrictedQuartermasterItem(makeItem({moderationStatus: status}))).toBe(true);
    }
  });

  it('treats only quarantined and auto-quarantined items as having hidden contents', () => {
    expect(isQuarantinedQuartermasterItem(makeItem({moderationStatus: ContentModerationStatus.quarantined}))).toBe(
      true,
    );
    expect(isQuarantinedQuartermasterItem(makeItem({moderationStatus: ContentModerationStatus.autoQuarantined}))).toBe(
      true,
    );
    expect(isQuarantinedQuartermasterItem(makeItem({moderationStatus: ContentModerationStatus.locked}))).toBe(false);
    expect(isQuarantinedQuartermasterItem(makeItem())).toBe(false);
  });

  it('lets only moderators open quarantined items, but anyone open locked ones', () => {
    const quarantined = makeItem({moderationStatus: ContentModerationStatus.quarantined});
    expect(canInteractWithQuartermasterItem(quarantined, user)).toBe(false);
    expect(canInteractWithQuartermasterItem(quarantined, ownerViewer)).toBe(false);
    expect(canInteractWithQuartermasterItem(quarantined, moderator)).toBe(true);
    const locked = makeItem({moderationStatus: ContentModerationStatus.locked});
    expect(canInteractWithQuartermasterItem(locked, user)).toBe(true);
    expect(canInteractWithQuartermasterItem(locked, ownerViewer)).toBe(true);
    expect(canInteractWithQuartermasterItem(makeItem(), user)).toBe(true);
  });

  it('mirrors swiftarr guardCanModifyContent', () => {
    expect(canModifyQuartermasterItem(makeItem(), ownerViewer)).toBe(true);
    expect(canModifyQuartermasterItem(makeItem(), user)).toBe(false);
    expect(canModifyQuartermasterItem(makeItem(), {...ownerViewer, hasVerified: false})).toBe(false);
    expect(
      canModifyQuartermasterItem(makeItem({moderationStatus: ContentModerationStatus.modReviewed}), ownerViewer),
    ).toBe(true);
    expect(canModifyQuartermasterItem(makeItem({moderationStatus: ContentModerationStatus.locked}), ownerViewer)).toBe(
      false,
    );
    expect(canModifyQuartermasterItem(makeItem({moderationStatus: ContentModerationStatus.locked}), moderator)).toBe(
      true,
    );
  });

  it('only offers Seamail for visible owners other than the viewer', () => {
    expect(canMessageQuartermasterOwner(makeItem(), user)).toBe(true);
    expect(canMessageQuartermasterOwner(makeItem(), ownerViewer)).toBe(false);
    expect(canMessageQuartermasterOwner(makeItem({owner: undefined, hideOwnerName: true}), user)).toBe(false);
  });

  it('builds the same Seamail subject as the website', () => {
    expect(getQuartermasterSeamailSubject(makeItem())).toBe('Re: Quartermastarr Item - Sunscreen');
  });
});

describe('Quartermastarr form conversion', () => {
  it('trims text and omits empty optional fields on create', () => {
    const data = toQuartermasterCreateData({
      ...getEmptyQuartermasterFormValues(QuartermasterCategory.need),
      itemName: '  Charger ',
      itemDescription: '   ',
      location: '',
    });
    expect(data).toEqual({
      category: QuartermasterCategory.need,
      location: undefined,
      hideOwnerName: false,
      items: [{itemName: 'Charger', itemDescription: undefined, image: undefined}],
    });
  });

  it('sends a new image, and drops an empty image object', () => {
    const base = {...getEmptyQuartermasterFormValues(), itemName: 'Chair'};
    expect(toQuartermasterCreateData({...base, image: {image: 'abc'}}).items[0].image).toEqual({image: 'abc'});
    expect(toQuartermasterCreateData({...base, image: {}}).items[0].image).toBeUndefined();
  });

  it('round-trips an existing photo as a filename so an edit keeps it', () => {
    const item = makeItem({image: 'photo.jpg', location: 'Lido', itemDescription: 'SPF 50'});
    const values = toQuartermasterFormValues(item);
    expect(values.image).toEqual({filename: 'photo.jpg'});
    expect(toQuartermasterContentData(values)).toEqual({
      category: QuartermasterCategory.have,
      itemName: 'Sunscreen',
      itemDescription: 'SPF 50',
      location: 'Lido',
      hideOwnerName: false,
      image: {filename: 'photo.jpg'},
    });
  });

  it('omits the image when the photo was cleared', () => {
    const values = {...toQuartermasterFormValues(makeItem({image: 'photo.jpg'})), image: {}};
    expect(toQuartermasterContentData(values).image).toBeUndefined();
  });
});
