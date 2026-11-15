import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';

/**
 * The list state a Quartermastarr link asks for.
 */
export interface QuartermasterLinkParams {
  category?: QuartermasterCategory;
  mine?: boolean;
}

/**
 * Maps the path a link opened the board with to the list state it implies, matching the
 * website's pages: `/quartermaster` is Have, `/quartermaster/need` is Need, and
 * `/quartermaster/owned` is the viewer's own items. Anything else, such as the About page,
 * asks for nothing.
 *
 * React Navigation aliases can't carry fixed params, so the screen reads them from the path the
 * route was opened with instead.
 *
 * @param path The route's `path`, if it was opened by a link.
 */
export const getQuartermasterLinkParams = (path?: string): QuartermasterLinkParams => {
  const clean = (path ?? '').split(/[?#]/)[0].replace(/\/+$/, '');
  if (/(^|\/)quartermaster\/need$/.test(clean)) {
    return {category: QuartermasterCategory.need, mine: false};
  }
  if (/(^|\/)quartermaster\/owned$/.test(clean)) {
    return {mine: true};
  }
  if (/(^|\/)quartermaster$/.test(clean)) {
    return {category: QuartermasterCategory.have, mine: false};
  }
  return {};
};
