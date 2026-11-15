/**
 * Whether a Quartermastarr item is on offer or wanted.
 * Matches Swiftarr's `QuartermasterCategory`.
 */
export enum QuartermasterCategory {
  /// The owner has this item to offer.
  have = 'have',
  /// The owner is looking for this item.
  need = 'need',
}

export namespace QuartermasterCategory {
  /**
   * User-facing label for a category.
   */
  export const getLabel = (category: QuartermasterCategory): string => {
    switch (category) {
      case QuartermasterCategory.have:
        return 'Have';
      case QuartermasterCategory.need:
        return 'Need';
    }
  };

  /**
   * Longer description used in the create/edit form.
   */
  export const getDescription = (category: QuartermasterCategory): string => {
    switch (category) {
      case QuartermasterCategory.have:
        return 'Have -- I have this to offer';
      case QuartermasterCategory.need:
        return "Need -- I'm looking for this";
    }
  };

  /**
   * All categories, in display order.
   */
  export const all: QuartermasterCategory[] = [QuartermasterCategory.have, QuartermasterCategory.need];
}
