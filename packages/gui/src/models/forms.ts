import { UIForm } from 'mithril-ui-form';
import {
  CastTypeOptions,
  Cast,
  CrimeScript,
  CrimeScriptAttributes,
  AttributeTypeOptions,
  Literature,
  CrimeLocation,
} from './data-model';
import { t } from '../services';

export const castForm = () =>
  [
    {
      id: 'cast',
      label: t('CAST'),
      className: 'col s12',
      repeat: true,
      // pageSize: 100,
      type: [
        { id: 'id', type: 'autogenerate', autogenerate: 'id' },
        { id: 'label', type: 'text', className: 'col s8', label: t('NAME') },
        { id: 'type', type: 'select', className: 'col s4', label: t('CAST_TYPE'), options: CastTypeOptions },
        // {
        //   id: 'skills',
        //   repeat: true,
        //   pageSize: 100,
        //   type: [
        //     { id: 'label', type: 'text', className: 'col s6', label: t('NAME') },
        //     { id: 'description', type: 'textarea', className: 'col s12', label: t('DESCRIPTION') },
        //     {
        //       id: 'level',
        //       type: 'select',
        //       className: 'col s6',
        //       label: t('CAST )type',
        //       options: LevelTypeOptions,
        //     },
        //   ],
        //   className: 'col s12',
        //   label: t('SKILLS'),
        // },
      ] as UIForm<Cast>,
    },
  ] as UIForm<{ cast: Cast[] }>;

export const attributesForm = () =>
  [
    {
      id: 'attributes',
      label: t('ATTRIBUTES'),
      className: 'col s12',
      repeat: true,
      // pageSize: 100,
      type: [
        { id: 'id', type: 'autogenerate', autogenerate: 'id' },
        { id: 'label', type: 'text', className: 'col s8', label: t('NAME') },
        { id: 'type', type: 'select', className: 'col s4', label: t('TYPE'), options: AttributeTypeOptions },
      ] as UIForm<CrimeScriptAttributes>,
    },
  ] as UIForm<{ attributes: CrimeScriptAttributes[] }>;

export const locationForm = () =>
  [
    {
      id: 'locations',
      label: t('LOCATIONS'),
      className: 'col s12',
      repeat: true,
      // pageSize: 100,
      type: [
        { id: 'id', type: 'autogenerate', autogenerate: 'id' },
        { id: 'label', type: 'text', className: 'col s6', label: t('NAME') },
        { id: 'url', type: 'base64', className: 'col s6', label: t('IMAGE') },
      ] as UIForm<CrimeLocation>,
    },
  ] as UIForm<{ locations: CrimeLocation[] }>;

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
