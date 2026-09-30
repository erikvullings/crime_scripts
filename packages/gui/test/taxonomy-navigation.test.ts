import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeDataModel } from '../src/models/model-normalization.ts';
import { findTaxonomyForItem } from '../src/models/taxonomy-navigation.ts';

test('taxonomy deep links select the tab containing the requested item', () => {
  const model = normalizeDataModel({
    crimeScripts: [],
    cast: [{ id: 'role', label: 'Role' }],
    attributes: [{ id: 'attribute', label: 'Attribute' }],
    products: [{ id: 'product', label: 'Product' }],
    transports: [{ id: 'transport', label: 'Transport' }],
    locations: [{ id: 'location', label: 'Location' }],
    geoLocations: [{ id: 'geo-location', label: 'Geographic location' }],
    partners: [{ id: 'partner', label: 'Partner' }],
  });

  assert.equal(findTaxonomyForItem(model, 'role'), 'cast');
  assert.equal(findTaxonomyForItem(model, 'attribute'), 'attributes');
  assert.equal(findTaxonomyForItem(model, 'product'), 'products');
  assert.equal(findTaxonomyForItem(model, 'transport'), 'transports');
  assert.equal(findTaxonomyForItem(model, 'location'), 'locations');
  assert.equal(findTaxonomyForItem(model, 'geo-location'), 'geoLocations');
  assert.equal(findTaxonomyForItem(model, 'partner'), 'partners');
  assert.equal(findTaxonomyForItem(model, 'missing'), undefined);
  assert.equal(findTaxonomyForItem(model, undefined), undefined);
});
