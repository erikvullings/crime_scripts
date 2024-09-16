import m, { FactoryComponent } from 'mithril';
import {
  Act,
  Activity,
  ActivityPhase,
  ActivityTypeOptions,
  Cast,
  Condition,
  CrimeScript,
  CrimeScriptAttributes,
  ID,
  IconOpts,
  Stage,
  Measure,
  CrimeLocation,
} from '../../models';
import { FlatButton, Tabs, uniqueId, Select, ISelectOptions } from 'mithril-materialized';
import { FormAttributes, LayoutForm, UIForm } from 'mithril-ui-form';
import { labelForm, literatureForm } from '../../models/forms';
import { MultiSelectDropdown } from '../ui/multi-select';
import { crimeMeasureOptions } from '../../models/situational-crime-prevention';
import { t } from '../../services/translations';

export const CrimeScriptEditor: FactoryComponent<{
  crimeScript: CrimeScript;
  cast: Cast[];
  acts: Act[];
  attributes: CrimeScriptAttributes[];
  locations: CrimeLocation[];
}> = () => {
  type InputOptions = {
    id: string;
    label?: string;
    group?: string;
    icon?: string;
  };

  const actsForm: UIForm<any> = [
    {
      id: 'stages',
      repeat: true,
      pageSize: 1,
      label: t('ACTS'),
      type: [] as UIForm<Partial<Stage>>,
    },
  ];

  let locationOptions: Array<InputOptions> = [];
  let castOptions: Array<InputOptions> = [];
  let attrOptions: Array<InputOptions> = [];
  let measuresForm: UIForm<any> = [];

  return {
    oninit: ({ attrs: { cast, attributes, locations } }) => {
      castOptions = cast.map(({ id, label }) => ({
        id,
        label,
        group: 'person',
      }));
      attrOptions = attributes.map(({ id, label }) => ({ id, label }));
      locationOptions = locations.map(({ id, label }) => ({ id, label }));
      const measOptions = crimeMeasureOptions();

      const measureForm: UIForm<Measure> = [
        { id: 'id', type: 'autogenerate', autogenerate: 'id' },
        { id: 'cat', type: 'select', options: measOptions, className: 'col s12 m5 l4', label: t('CATEGORY') },
        { id: 'label', type: 'text', className: 'col s12 m7 l8', label: t('NAME') },
        // { id: 'description', type: 'textarea', className: 'col s12', label: t('DESCRIPTION') },
      ];

      measuresForm = [{ id: 'measures', type: measureForm, repeat: true, label: t('MEASURES') }];
    },
    view: ({ attrs: { acts, crimeScript } }) => {
      const activityForm: UIForm<any> = [
        {
          id: 'locationId',
          type: 'select',
          label: t('LOCATION'),
          options: locationOptions,
        },
        {
          id: 'activities',
          repeat: true,
          type: [
            { id: 'id', type: 'autogenerate', autogenerate: 'id' },
            { id: 'label', type: 'textarea', className: 'col s8 m9 xl10', label: t('ACTIVITY') },
            {
              id: 'type',
              type: 'options',
              className: 'col s4 m3 xl2',
              label: t('SPECIFY'),
              options: ActivityTypeOptions,
              checkboxClass: 'col s6',
            },
            {
              id: 'cast',
              show: ['type=1', 'type=4'],
              type: 'select',
              className: 'col s12 m6',
              multiple: true,
              options: castOptions,
              label: t('CAST'),
            },
            {
              id: 'attributes',
              show: ['type=2', 'type=4'],
              type: 'select',
              className: 'col s12 m6',
              multiple: true,
              options: attrOptions,
              label: t('ATTRIBUTES'),
            },
            {
              id: 'description',
              label: t('DESCRIPTION'),
              type: 'textarea',
            },
          ] as UIForm<Activity>,
          className: 'col s12',
          label: t('ACTIVITIES'),
        },
        {
          id: 'conditions',
          repeat: true,
          type: [
            { id: 'id', type: 'autogenerate', autogenerate: 'id' },
            { id: 'label', type: 'textarea', className: 'col s12', label: t('CONDITION') },
          ] as UIForm<Condition>,
          className: 'col s12',
          label: t('CONDITIONS'),
        },
      ];

      const curActIdx = +(m.route.param('stages') || 1) - 1;
      const curActIds = crimeScript.stages && curActIdx < crimeScript.stages.length && crimeScript.stages[curActIdx];
      const curActId = curActIds && curActIds.id;
      const curAct = curActId && acts.find((a) => a.id === curActId);
      if (curAct) {
        if (!curAct.preparation) curAct.preparation = {} as ActivityPhase;
        if (!curAct.preactivity) curAct.preactivity = {} as ActivityPhase;
        if (!curAct.activity) curAct.activity = {} as ActivityPhase;
        if (!curAct.postactivity) curAct.postactivity = {} as ActivityPhase;
        if (!curAct.measures) curAct.measures = [];
      }

      return m('.col.s12', [
        m(LayoutForm, {
          form: [
            ...labelForm(),
            { id: 'literature', type: literatureForm(), repeat: true, label: t('REFERENCES') },
            ...actsForm,
          ],
          obj: crimeScript,
          onchange: () => {},
        } as FormAttributes<Partial<CrimeScript>>),

        curActIds &&
          m(
            '.col.s12',
            m('.row', [
              m(
                '.col.s12',
                m(MultiSelectDropdown, {
                  items: acts,
                  selectedIds: curActIds.ids,
                  label: t('SELECT_ACT_N'),
                  max: 5,
                  search: true,
                  selectAll: false,
                  listAll: true,
                  onchange: (selectedIds) => {
                    crimeScript.stages[curActIdx] = {
                      id: selectedIds.length > 0 ? selectedIds[0] : '',
                      ids: selectedIds,
                    };
                    m.redraw();
                  },
                })
              ),
              curActIds.ids &&
                curActIds.ids.length > 0 && [
                  m(Select, {
                    key: curAct ? curAct.label : curActIds.id,
                    label: t('SELECT_ACT'),
                    className: 'col s6',
                    initialValue: curActIds.id,
                    // disabled: curActIds.ids.length === 1,
                    options: acts.filter((a) => curActIds.ids.includes(a.id)),
                    onchange: (id) => {
                      crimeScript.stages[curActIdx].id = id[0];
                    },
                  } as ISelectOptions<ID>),
                ],
              m(FlatButton, {
                label: t('ACT'),
                className: 'col s6',
                iconName: 'add',
                onclick: () => {
                  const id = uniqueId();
                  const newAct = {
                    id,
                    label: t('ACT'),
                    activity: {},
                    preparation: {},
                    preactivity: {},
                    postactivity: {},
                  } as Act;
                  acts.push(newAct);
                  crimeScript.stages[curActIdx].id = id;
                  if (crimeScript.stages[curActIdx].ids) {
                    crimeScript.stages[curActIdx].ids.push(id);
                  } else {
                    crimeScript.stages[curActIdx].ids = [id];
                  }
                },
              }),
            ])
          ),

        curAct && [
          m('.cur-act', { key: curAct.id }, [
            m(LayoutForm, {
              form: [
                { id: 'label', type: 'text', className: 'col s6 m6', label: t('NAME') },
                { id: 'icon', type: 'select', className: 'col s6 m3', label: t('IMAGE'), options: IconOpts },
                { id: 'url', type: 'base64', className: 'col s12 m3', label: t('IMAGE'), show: ['icon=1'] },
                { id: 'description', type: 'textarea', className: 'col s12', label: t('SUMMARY') },
              ],
              obj: curAct,
              onchange: () => {},
            } as FormAttributes<Partial<Act>>),
            m(Tabs, {
              tabs: [
                {
                  title: t('PREPARATION_PHASE'),
                  vnode: m('.acts', [
                    m(LayoutForm, {
                      form: activityForm,
                      obj: curAct.preparation,
                      onchange: () => {},
                    } as FormAttributes<Partial<ActivityPhase>>),
                  ]),
                },
                {
                  title: t('PRE_ACTIVITY_PHASE'),
                  vnode: m('.acts', [
                    m(LayoutForm, {
                      form: activityForm,
                      obj: curAct.preactivity,
                      onchange: () => {},
                    } as FormAttributes<Partial<ActivityPhase>>),
                  ]),
                },
                {
                  title: t('ACTIVITY_PHASE'),
                  vnode: m('.acts', [
                    m(LayoutForm, {
                      form: activityForm,
                      obj: curAct.activity,
                      onchange: () => {},
                    } as FormAttributes<Partial<ActivityPhase>>),
                  ]),
                },
                {
                  title: t('POST_ACTIVITY_PHASE'),
                  vnode: m('.acts', [
                    m(LayoutForm, {
                      form: activityForm,
                      obj: curAct.postactivity,
                      onchange: () => {},
                    } as FormAttributes<Partial<ActivityPhase>>),
                  ]),
                },
              ],
            }),
            m('h5', t('MEASURES')),
            m(LayoutForm, {
              form: measuresForm,
              obj: curAct,
              onchange: () => {
                console.log(curAct);
              },
            } as FormAttributes<Partial<ActivityPhase>>),
          ]),
        ],
      ]);
    },
  };
};
