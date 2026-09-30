import type { DataModel, ID } from './data-model';
import type { TaxonomyName } from './taxonomy-references';

const taxonomyNames: TaxonomyName[] = [
  'cast',
  'attributes',
  'products',
  'transports',
  'locations',
  'geoLocations',
  'partners',
];

export const findTaxonomyForItem = (
  model: DataModel,
  itemId?: ID
): TaxonomyName | undefined =>
  itemId
    ? taxonomyNames.find((taxonomy) => model[taxonomy].some(({ id }) => id === itemId))
    : undefined;
