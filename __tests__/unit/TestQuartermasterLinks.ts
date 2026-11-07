import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {getQuartermasterLinkParams} from '#src/Libraries/Quartermaster/QuartermasterLinks';

describe('getQuartermasterLinkParams', () => {
  it('selects Need for the Need page', () => {
    expect(getQuartermasterLinkParams('/quartermaster/need')).toEqual({
      category: QuartermasterCategory.need,
      mine: false,
    });
  });

  it("selects the viewer's own items for the Owned page, leaving the category alone", () => {
    expect(getQuartermasterLinkParams('/quartermaster/owned')).toEqual({mine: true});
  });

  it('selects Have for the bare board path, with or without a trailing slash or query', () => {
    const have = {category: QuartermasterCategory.have, mine: false};
    expect(getQuartermasterLinkParams('/quartermaster')).toEqual(have);
    expect(getQuartermasterLinkParams('quartermaster/')).toEqual(have);
    expect(getQuartermasterLinkParams('/quartermaster?x=1')).toEqual(have);
  });

  it('asks for nothing from other paths', () => {
    expect(getQuartermasterLinkParams(undefined)).toEqual({});
    expect(getQuartermasterLinkParams('/quartermaster/about')).toEqual({});
    expect(getQuartermasterLinkParams('/quartermaster/3F2504E0-4F89-11D3-9A0C-0305E82C3301')).toEqual({});
    expect(getQuartermasterLinkParams('/performers')).toEqual({});
  });
});
