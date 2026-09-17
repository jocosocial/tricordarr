/**
 * A selectable item. This is used to identify an item that can be selected in a list.
 * It should not contain any significant data about the item itself.
 *
 * Implement additional `fromThing` functions in `useSelectable` for specific types of items.
 */
export interface Selectable {
  id: string;
}
