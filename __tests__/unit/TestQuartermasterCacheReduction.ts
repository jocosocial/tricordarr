import {InfiniteData} from '@tanstack/react-query';

import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {
  applyCreatedItems,
  applyDeletedItem,
  applyUpdatedItem,
} from '#src/Libraries/Quartermaster/QuartermasterCacheReduction';
import {QuartermasterData, QuartermasterListData} from '#src/Structs/ControllerStructs';

const makeItem = (itemID: string, category = QuartermasterCategory.have): QuartermasterData => ({
  itemID,
  category,
  itemName: `Item ${itemID}`,
  hideOwnerName: false,
  moderationStatus: ContentModerationStatus.normal,
  lastModificationTime: '2026-01-01T00:00:00Z',
});

const makeData = (ids: string[], total = ids.length): InfiniteData<QuartermasterListData> => ({
  pageParams: [undefined],
  pages: [{items: ids.map(id => makeItem(id)), paginator: {total, start: 0, limit: 50}}],
});

const ids = (data: InfiniteData<QuartermasterListData>) => data.pages.flatMap(p => p.items.map(i => i.itemID));

describe('applyCreatedItems', () => {
  it('prepends matching items in batch order and bumps the total', () => {
    const result = applyCreatedItems(makeData(['a']), {category: QuartermasterCategory.have}, [
      makeItem('x'),
      makeItem('y'),
    ]);
    expect(ids(result)).toEqual(['x', 'y', 'a']);
    expect(result.pages[0].paginator.total).toBe(3);
  });

  it('ignores lists for the other category', () => {
    const data = makeData(['a']);
    expect(applyCreatedItems(data, {category: QuartermasterCategory.need}, [makeItem('x')])).toBe(data);
  });

  it('skips search lists', () => {
    const data = makeData(['a']);
    expect(applyCreatedItems(data, {category: QuartermasterCategory.have, search: 'foo'}, [makeItem('x')])).toBe(data);
  });

  it('accepts items into a mine list', () => {
    const result = applyCreatedItems(makeData(['a']), {category: QuartermasterCategory.have, mine: true}, [
      makeItem('x'),
    ]);
    expect(ids(result)).toEqual(['x', 'a']);
  });

  it('does not duplicate items already present', () => {
    const data = makeData(['x']);
    expect(applyCreatedItems(data, {category: QuartermasterCategory.have}, [makeItem('x')])).toBe(data);
  });
});

describe('applyUpdatedItem', () => {
  it('moves a present item to the top', () => {
    const result = applyUpdatedItem(
      makeData(['a', 'b', 'c']),
      {category: QuartermasterCategory.have},
      makeItem('c'),
      true,
    );
    expect(ids(result)).toEqual(['c', 'a', 'b']);
    expect(result.pages[0].paginator.total).toBe(3);
  });

  it('removes an item whose category no longer matches the list', () => {
    const result = applyUpdatedItem(
      makeData(['a', 'b']),
      {category: QuartermasterCategory.have},
      makeItem('b', QuartermasterCategory.need),
      true,
    );
    expect(ids(result)).toEqual(['a']);
    expect(result.pages[0].paginator.total).toBe(1);
  });

  it('adds an item to the list for its new category', () => {
    const result = applyUpdatedItem(
      makeData(['a']),
      {category: QuartermasterCategory.need},
      makeItem('b', QuartermasterCategory.need),
      true,
    );
    expect(ids(result)).toEqual(['b', 'a']);
    expect(result.pages[0].paginator.total).toBe(2);
  });

  it("does not add someone else's item to a mine list", () => {
    const data = makeData(['a']);
    expect(applyUpdatedItem(data, {category: QuartermasterCategory.have, mine: true}, makeItem('z'), false)).toBe(data);
  });

  it('replaces in place in a search list and never inserts', () => {
    const edited = {...makeItem('b'), itemName: 'Renamed'};
    const replaced = applyUpdatedItem(
      makeData(['a', 'b']),
      {category: QuartermasterCategory.have, search: 'x'},
      edited,
      true,
    );
    expect(ids(replaced)).toEqual(['a', 'b']);
    expect(replaced.pages[0].items[1].itemName).toBe('Renamed');
    const data = makeData(['a']);
    expect(applyUpdatedItem(data, {category: QuartermasterCategory.have, search: 'x'}, makeItem('q'), true)).toBe(data);
  });
});

describe('applyDeletedItem', () => {
  it('removes the item and drops the total', () => {
    const result = applyDeletedItem(makeData(['a', 'b']), 'a');
    expect(ids(result)).toEqual(['b']);
    expect(result.pages[0].paginator.total).toBe(1);
  });

  it('leaves lists without the item untouched', () => {
    const data = makeData(['a']);
    expect(applyDeletedItem(data, 'zzz')).toBe(data);
  });
});
