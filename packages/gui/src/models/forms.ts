import { UIForm } from 'mithril-ui-form';
import { CrimeScript, Literature, Labeled, Hierarchical } from './data-model';
import { t } from '../services';

export type AttributeType = 'cast' | 'attributes' | 'transports' | 'locations' | 'geoLocations' | 'products';

export const attrForm = (id: AttributeType, label: string, attr: Labeled[]) => [
  {
    id,
    label,
    className: 'col s12',
    repeat: true,
    // pageSize: 100,
    type: [
      { id: 'id', type: 'autogenerate', autogenerate: 'id' },
      { id: 'label', type: 'text', className: 'col s12 m4', label: t('NAME') },
      { id: 'synonyms', type: 'tags', className: 'col s12 m8', label: t('SYNONYMS') },
      {
        id: 'parents',
        type: 'select',
        multiple: true,
        className: 'col s12',
        label: t('CATEGORIES'),
        options: attr,
      },
      // { id: 'url', type: 'base64', className: 'col s6', label: t('IMAGE') },
    ] as UIForm<Hierarchical & Labeled>,
  },
];

export const labelForm = () =>
  [
    { id: 'id', type: 'autogenerate', autogenerate: 'id' },
    { id: 'label', type: 'text', className: 'col s6', label: t('NAME') },
    { id: 'url', type: 'base64', className: 'col s6', label: t('IMAGE') },
    { id: 'description', type: 'textarea', className: 'col s12', label: t('SUMMARY') },
  ] as UIForm<Partial<CrimeScript>>;

export const literatureForm = () =>
  [
    { id: 'id', type: 'autogenerate', autogenerate: 'id' },
    { id: 'label', type: 'text', className: 'col s6', label: t('TITLE') },
    { id: 'authors', type: 'text', className: 'col s6', label: t('AUTHORS') },
    { id: 'url', type: 'url', className: 'col s12', label: t('LINK') },
    { id: 'description', type: 'textarea', className: 'col s12', label: t('SUMMARY') },
  ] as UIForm<Partial<Literature>>;
