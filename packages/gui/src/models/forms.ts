import { UIForm } from 'mithril-ui-form';
import {
  CastTypeOptions,
  Cast,
  CrimeScript,
  CrimeSceneAttributes,
  AttributeTypeOptions,
  Literature,
} from './data-model';

export const castForm = [
  {
    id: 'cast',
    label: 'Cast',
    className: 'col s12',
    repeat: true,
    // pageSize: 100,
    type: [
      { id: 'id', type: 'autogenerate', autogenerate: 'id' },
      { id: 'label', type: 'text', className: 'col s8', label: 'Name' },
      { id: 'type', type: 'select', className: 'col s4', label: 'Cast type', options: CastTypeOptions },
      // {
      //   id: 'skills',
      //   repeat: true,
      //   pageSize: 100,
      //   type: [
      //     { id: 'label', type: 'text', className: 'col s6', label: 'Name' },
      //     { id: 'description', type: 'textarea', className: 'col s12', label: 'Description' },
      //     {
      //       id: 'level',
      //       type: 'select',
      //       className: 'col s6',
      //       label: 'Cast type',
      //       options: LevelTypeOptions,
      //     },
      //   ],
      //   className: 'col s12',
      //   label: 'Skills',
      // },
    ] as UIForm<Cast>,
  },
] as UIForm<{ cast: Cast[] }>;

export const attributesForm = [
  {
    id: 'attributes',
    label: 'Attributes',
    className: 'col s12',
    repeat: true,
    // pageSize: 100,
    type: [
      { id: 'id', type: 'autogenerate', autogenerate: 'id' },
      { id: 'label', type: 'text', className: 'col s8', label: 'Name' },
      { id: 'type', type: 'select', className: 'col s4', label: 'Type', options: AttributeTypeOptions },
    ] as UIForm<CrimeSceneAttributes>,
  },
] as UIForm<{ attributes: CrimeSceneAttributes[] }>;

export const labelForm = [
  { id: 'id', type: 'autogenerate', autogenerate: 'id' },
  { id: 'label', type: 'text', className: 'col s6', label: 'Name' },
  { id: 'url', type: 'base64', className: 'col s6', label: 'Image' },
  { id: 'description', type: 'textarea', className: 'col s12', label: 'Summary' },
] as UIForm<Partial<CrimeScript>>;

export const literatureForm = [
  { id: 'id', type: 'autogenerate', autogenerate: 'id' },
  { id: 'label', type: 'text', className: 'col s6', label: 'Title' },
  { id: 'authors', type: 'text', className: 'col s6', label: 'Authors' },
  { id: 'url', type: 'url', className: 'col s12', label: 'Link' },
  { id: 'description', type: 'textarea', className: 'col s12', label: 'Summary' },
] as UIForm<Partial<Literature>>;
