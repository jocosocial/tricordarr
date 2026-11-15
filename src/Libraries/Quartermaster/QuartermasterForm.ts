import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {
  ImageUploadData,
  QuartermasterContentData,
  QuartermasterCreateData,
  QuartermasterData,
} from '#src/Structs/ControllerStructs';
import {QuartermasterFormValues} from '#src/Types/FormValues';

/** Swiftarr's limits on Quartermastarr text fields. */
export const QUARTERMASTER_NAME_MIN = 2;
export const QUARTERMASTER_NAME_MAX = 100;
export const QUARTERMASTER_DESCRIPTION_MAX = 2048;
export const QUARTERMASTER_LOCATION_MIN = 3;
export const QUARTERMASTER_LOCATION_MAX = 100;

/**
 * Blank form values for a new item.
 * @param category The category to preselect.
 */
export const getEmptyQuartermasterFormValues = (
  category: QuartermasterCategory = QuartermasterCategory.have,
): QuartermasterFormValues => ({
  category,
  itemName: '',
  itemDescription: '',
  location: '',
  hideOwnerName: false,
  image: {},
});

/**
 * Form values for editing an existing item. The photo is carried as `{filename}` so that
 * saving without touching it keeps it, since an update replaces the photo state wholesale.
 */
export const toQuartermasterFormValues = (item: QuartermasterData): QuartermasterFormValues => ({
  category: item.category,
  itemName: item.itemName,
  itemDescription: item.itemDescription ?? '',
  location: item.location ?? '',
  hideOwnerName: item.hideOwnerName,
  image: item.image ? {filename: item.image} : {},
});

/**
 * Trims a free-text field and drops it when empty so the server clears/omits it.
 */
const optionalText = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

/**
 * An image payload only when it holds something. `{}` means no photo, which the server reads
 * the same as an omitted image, so it is left out rather than sent empty.
 */
const optionalImage = (image: ImageUploadData): ImageUploadData | undefined => {
  if (image.image) {
    return {image: image.image};
  }
  if (image.filename) {
    return {filename: image.filename};
  }
  return undefined;
};

/**
 * Builds a single-item create request from the form.
 */
export const toQuartermasterCreateData = (values: QuartermasterFormValues): QuartermasterCreateData => ({
  category: values.category,
  location: optionalText(values.location),
  hideOwnerName: values.hideOwnerName,
  items: [
    {
      itemName: values.itemName.trim(),
      itemDescription: optionalText(values.itemDescription),
      image: optionalImage(values.image),
    },
  ],
});

/**
 * Builds an update request from the form.
 */
export const toQuartermasterContentData = (values: QuartermasterFormValues): QuartermasterContentData => ({
  category: values.category,
  itemName: values.itemName.trim(),
  itemDescription: optionalText(values.itemDescription),
  location: optionalText(values.location),
  hideOwnerName: values.hideOwnerName,
  image: optionalImage(values.image),
});
